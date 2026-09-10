import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AdminUpdateStoreDto } from "./dto";

/** LYNKO-X platforma administratori uchun: barcha do'konlar va foydalanuvchilar. */
@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async stats() {
    const [merchants, stores, activeStores, products, orders, revenue, latestStores] =
      await Promise.all([
        this.prisma.user.count({ where: { role: "MERCHANT" } }),
        this.prisma.store.count(),
        this.prisma.store.count({ where: { isActive: true } }),
        this.prisma.product.count(),
        this.prisma.order.count(),
        this.prisma.order.aggregate({
          where: { status: { not: "CANCELLED" } },
          _sum: { total: true },
        }),
        this.prisma.store.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            name: true,
            slug: true,
            plan: true,
            isActive: true,
            createdAt: true,
            owner: { select: { name: true, email: true } },
          },
        }),
      ]);
    return {
      merchants,
      stores,
      activeStores,
      products,
      orders,
      revenue: revenue._sum.total ?? 0,
      latestStores,
    };
  }

  listStores(search?: string) {
    return this.prisma.store.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { slug: { contains: search, mode: "insensitive" } },
              { owner: { email: { contains: search, mode: "insensitive" } } },
            ],
          }
        : undefined,
      select: {
        id: true,
        name: true,
        slug: true,
        plan: true,
        isActive: true,
        phone: true,
        createdAt: true,
        owner: { select: { id: true, name: true, email: true } },
        _count: { select: { products: true, orders: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async updateStore(id: string, dto: AdminUpdateStoreDto) {
    const store = await this.prisma.store.findUnique({ where: { id } });
    if (!store) throw new NotFoundException("Do'kon topilmadi");
    return this.prisma.store.update({
      where: { id },
      data: dto,
      select: { id: true, plan: true, isActive: true },
    });
  }

  listUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        stores: { select: { slug: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }
}
