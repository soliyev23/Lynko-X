import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
  UnauthorizedException,
  createParamDecorator,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { PrismaService } from "../prisma/prisma.service";

export type AdminRole = "OWNER" | "SUPPORT" | "FINANCE";

export interface AuthUser {
  userId: string;
  email: string;
  role: "MERCHANT" | "ADMIN";
  /** Faqat ADMIN uchun: huquq darajasi. null = eng kam huquq (SUPPORT kabi) */
  adminRole?: AdminRole | null;
}

export const ADMIN_ROLES_KEY = "adminRoles";
/** Endpoint faqat ko'rsatilgan admin huquqlari uchun. Ko'rsatilmasa har qanday admin. */
export const AdminRoles = (...roles: AdminRole[]) => SetMetadata(ADMIN_ROLES_KEY, roles);

/** Huquqni tekshirish uchun yordamchi: null rol eng kam huquq sifatida qaraladi */
export function effectiveAdminRole(user: AuthUser): AdminRole {
  return user.adminRole ?? "SUPPORT";
}

function extractToken(req: Request): string {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) throw new UnauthorizedException("Token topilmadi");
  return token;
}

/** Tizimga kirgan har qanday foydalanuvchi (sotuvchi yoki admin). */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<Request>();
    try {
      const payload = await this.jwt.verifyAsync(extractToken(req));
      (req as any).user = {
        userId: payload.sub,
        email: payload.email,
        role: payload.role ?? "MERCHANT",
      } satisfies AuthUser;
      return true;
    } catch (e) {
      if (e instanceof UnauthorizedException) throw e;
      throw new UnauthorizedException("Token yaroqsiz yoki muddati o'tgan");
    }
  }
}

/** Faqat LYNKO-X platforma administratori. Rol bazadan tekshiriladi. */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<Request>();
    let payload: { sub: string; email: string };
    try {
      payload = await this.jwt.verifyAsync(extractToken(req));
    } catch (e) {
      if (e instanceof UnauthorizedException) throw e;
      throw new UnauthorizedException("Token yaroqsiz yoki muddati o'tgan");
    }
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { role: true, adminRole: true },
    });
    if (!user || user.role !== "ADMIN") {
      throw new ForbiddenException(
        "Bu bo'lim faqat platforma administratori uchun",
      );
    }
    const authUser: AuthUser = {
      userId: payload.sub,
      email: payload.email,
      role: user.role,
      adminRole: user.adminRole,
    };
    const required = this.reflector.getAllAndOverride<AdminRole[] | undefined>(ADMIN_ROLES_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (required?.length && !required.includes(effectiveAdminRole(authUser))) {
      throw new ForbiddenException("Bu amal uchun huquq yetarli emas");
    }
    (req as any).user = authUser;
    return true;
  }
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    return ctx.switchToHttp().getRequest().user;
  },
);
