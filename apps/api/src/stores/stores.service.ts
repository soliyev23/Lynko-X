import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateStoreDto } from "./dto";

@Injectable()
export class StoresService {
  constructor(private readonly prisma: PrismaService) {}

  /** Foydalanuvchining do'konini topadi (MVP: har userda 1 ta do'kon). */
  async getStoreForUser(userId: string) {
    const store = await this.prisma.store.findFirst({
      where: { ownerId: userId },
    });
    if (!store) throw new NotFoundException("Do'kon topilmadi");
    return store;
  }

  async update(userId: string, dto: UpdateStoreDto) {
    const store = await this.getStoreForUser(userId);
    // Bo'sh qoldirilgan ixtiyoriy maydonlar null bo'lib saqlanadi
    const data = Object.fromEntries(
      Object.entries(dto).map(([k, v]) => [k, v === "" ? null : v]),
    );
    return this.prisma.store.update({ where: { id: store.id }, data });
  }

  async stats(userId: string) {
    const store = await this.getStoreForUser(userId);
    const [products, orders, newOrders, revenue] = await Promise.all([
      this.prisma.product.count({ where: { storeId: store.id } }),
      this.prisma.order.count({ where: { storeId: store.id } }),
      this.prisma.order.count({
        where: { storeId: store.id, status: "NEW" },
      }),
      this.prisma.order.aggregate({
        where: { storeId: store.id, status: { not: "CANCELLED" } },
        _sum: { total: true },
      }),
    ]);
    return {
      products,
      orders,
      newOrders,
      revenue: revenue._sum.total ?? 0,
    };
  }
}
