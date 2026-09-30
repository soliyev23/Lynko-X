import { Injectable } from "@nestjs/common";
import { abandonedAfterMs } from "../common/order-lines";
import { PrismaService } from "../prisma/prisma.service";
import { StoresService } from "../stores/stores.service";

/**
 * Tugallanmagan xaridlar: xaridor telefonini kiritgan, lekin buyurtma bermagan
 * savatlar. Sessiyalarni vitrina yozadi (storefront.service), sotuvchi faqat ko'radi.
 */
@Injectable()
export class CheckoutsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stores: StoresService,
  ) {}

  async list(userId: string, status?: string) {
    const store = await this.stores.getStoreForUser(userId);
    const where =
      status === "recovered"
        ? { storeId: store.id, recovered: true }
        : {
            storeId: store.id,
            completedAt: null,
            updatedAt: { lt: new Date(Date.now() - abandonedAfterMs()) },
          };
    return this.prisma.checkoutSession.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      take: 200,
      select: {
        id: true,
        token: true,
        customerName: true,
        phone: true,
        address: true,
        items: true,
        subtotal: true,
        recovered: true,
        recoveryOpenedAt: true,
        completedAt: true,
        createdAt: true,
        updatedAt: true,
        order: { select: { id: true, number: true, total: true } },
      },
    });
  }

  async remove(userId: string, id: string) {
    const store = await this.stores.getStoreForUser(userId);
    await this.prisma.checkoutSession.deleteMany({
      where: { id, storeId: store.id },
    });
    return { ok: true };
  }
}
