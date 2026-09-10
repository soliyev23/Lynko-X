import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
  createParamDecorator,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { PrismaService } from "../prisma/prisma.service";

export interface AuthUser {
  userId: string;
  email: string;
  role: "MERCHANT" | "ADMIN";
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
      select: { role: true },
    });
    if (!user || user.role !== "ADMIN") {
      throw new ForbiddenException(
        "Bu bo'lim faqat platforma administratori uchun",
      );
    }
    (req as any).user = {
      userId: payload.sub,
      email: payload.email,
      role: user.role,
    } satisfies AuthUser;
    return true;
  }
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    return ctx.switchToHttp().getRequest().user;
  },
);
