import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { PrismaService } from "../prisma/prisma.service";
import { LoginDto, RegisterDto } from "./dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const emailTaken = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (emailTaken)
      throw new ConflictException("Bu email allaqachon ro'yxatdan o'tgan");

    const slugTaken = await this.prisma.store.findUnique({
      where: { slug: dto.storeSlug },
    });
    if (slugTaken)
      throw new ConflictException("Bu do'kon manzili (slug) band");

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        passwordHash: await bcrypt.hash(dto.password, 10),
        stores: {
          create: { name: dto.storeName, slug: dto.storeSlug },
        },
      },
      include: { stores: true },
    });

    return this.buildSession(user.id, user.email, user.name, user.stores[0]);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { stores: true },
    });
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException("Email yoki parol noto'g'ri");
    }
    return this.buildSession(user.id, user.email, user.name, user.stores[0]);
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { id: true, email: true, name: true, stores: true },
    });
    return { user: { id: user.id, email: user.email, name: user.name }, store: user.stores[0] ?? null };
  }

  private async buildSession(
    userId: string,
    email: string,
    name: string,
    store: { id: string; slug: string; name: string } | undefined,
  ) {
    const token = await this.jwt.signAsync({ sub: userId, email });
    return { token, user: { id: userId, email, name }, store: store ?? null };
  }
}
