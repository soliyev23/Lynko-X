import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { StoresService } from "../stores/stores.service";
import { OrderStatusValue } from "./dto";

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stores: StoresService,
  ) {}

  async list(userId: string, status?: string) {
    const store = await this.stores.getStoreForUser(userId);
    return this.prisma.order.findMany({
      where: {
        storeId: store.id,
        ...(status ? { status: status as OrderStatusValue } : {}),
      },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async getOne(userId: string, id: string) {
    const store = await this.stores.getStoreForUser(userId);
    const order = await this.prisma.order.findFirst({
      where: { id, storeId: store.id },
      include: { items: true, payments: true },
    });
    if (!order) throw new NotFoundException("Buyurtma topilmadi");
    return order;
  }

  async updateStatus(userId: string, id: string, status: OrderStatusValue) {
    const order = await this.getOne(userId, id);
    if (order.status === status) return order;
    if (order.status === "CANCELLED") {
      throw new BadRequestException(
        "Bekor qilingan buyurtma holatini o'zgartirib bo'lmaydi",
      );
    }

    // Bekor qilinsa — mahsulotlar (variant bo'lsa, variant) omborga qaytariladi
    if (status === "CANCELLED") {
      return this.prisma.$transaction(async (tx) => {
        for (const item of order.items) {
          if (item.variantId) {
            await tx.productVariant.updateMany({
              where: { id: item.variantId },
              data: { stock: { increment: item.quantity } },
            });
          } else if (item.productId) {
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } },
            });
          }
        }
        return tx.order.update({
          where: { id },
          data: { status },
          include: { items: true, payments: true },
        });
      });
    }

    return this.prisma.order.update({
      where: { id },
      data: { status },
      include: { items: true, payments: true },
    });
  }
}
