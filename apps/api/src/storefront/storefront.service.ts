import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { TelegramService } from "../notifications/telegram.service";
import { PaymentsService } from "../payments/payments.service";
import { PrismaService } from "../prisma/prisma.service";
import { CheckoutDto } from "./dto";
import {
  effectivePlan,
  planLimit,
  type SubscriptionSource,
} from "../common/plans";

const PAGE_SIZE = 24;

/** Telefon raqamini solishtirish uchun: faqat raqamlar, oxirgi 9 tasi. */
function phoneKey(phone: string): string {
  return phone.replace(/\D/g, "").slice(-9);
}

@Injectable()
export class StorefrontService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly payments: PaymentsService,
    private readonly telegram: TelegramService,
  ) {}

  /** Do'kon (ichki): obuna maydonlari bilan. */
  private async findStore(slug: string) {
    const store = await this.prisma.store.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        phone: true,
        telegram: true,
        logoUrl: true,
        bannerUrl: true,
        theme: true,
        currency: true,
        deliveryFee: true,
        isActive: true,
        plan: true,
        planExpiresAt: true,
        isTrial: true,
        categories: { select: { id: true, name: true, slug: true } },
      },
    });
    if (!store || !store.isActive)
      throw new NotFoundException("Do'kon topilmadi");
    return store;
  }

  /** Do'kon (ommaviy): obuna maydonlari ko'rsatilmaydi. */
  async getStore(slug: string) {
    const { plan, planExpiresAt, isTrial, ...pub } = await this.findStore(slug);
    void plan; void planExpiresAt; void isTrial;
    return pub;
  }

  /**
   * Tarif limiti: FREE'da (yoki muddati o'tgan pullik tarifda) vitrinada faqat
   * birinchi N ta faol mahsulot ko'rinadi va sotiladi. Cheksiz tarifda filtr yo'q.
   */
  private async visibleFilter(store: SubscriptionSource & { id: string }) {
    const limit = planLimit(effectivePlan(store));
    if (limit == null) return {};
    const first = await this.prisma.product.findMany({
      where: { storeId: store.id, isActive: true },
      orderBy: { createdAt: "asc" },
      take: limit,
      select: { id: true },
    });
    return { id: { in: first.map((p) => p.id) } };
  }

  async listProducts(
    slug: string,
    categorySlug?: string,
    search?: string,
    page = 1,
  ) {
    const store = await this.findStore(slug);
    const where = {
      storeId: store.id,
      isActive: true,
      ...(await this.visibleFilter(store)),
      ...(categorySlug ? { category: { slug: categorySlug } } : {}),
      ...(search
        ? { name: { contains: search, mode: "insensitive" as const } }
        : {}),
    };
    const safePage = Math.max(1, Math.floor(page) || 1);
    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip: (safePage - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        comparePrice: true,
        stock: true,
        images: true,
        category: { select: { name: true, slug: true } },
        variants: {
          select: { id: true, name: true, price: true, stock: true },
          orderBy: { sortOrder: "asc" },
        },
      },
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.product.count({ where }),
    ]);
    return {
      items,
      total,
      page: safePage,
      pageSize: PAGE_SIZE,
      totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    };
  }

  async getProduct(slug: string, productSlug: string) {
    const store = await this.findStore(slug);
    const product = await this.prisma.product.findFirst({
      where: {
        storeId: store.id,
        slug: productSlug,
        isActive: true,
        ...(await this.visibleFilter(store)),
      },
      include: {
        category: { select: { name: true, slug: true } },
        variants: {
          select: { id: true, name: true, price: true, stock: true },
          orderBy: { sortOrder: "asc" },
        },
      },
    });
    if (!product) throw new NotFoundException("Mahsulot topilmadi");
    return product;
  }

  /**
   * Checkout: narxlar va ombor qoldig'i FAQAT serverda tekshiriladi.
   * Stock decrement `updateMany ... stock >= qty` bilan — ikki xaridor bir
   * vaqtda oxirgi donani olib qo'yishidan himoya (race condition).
   */
  async checkout(slug: string, dto: CheckoutDto) {
    const store = await this.findStore(slug);
    const visible = await this.visibleFilter(store);

    const order = await this.prisma.$transaction(async (tx) => {
      const productIds = dto.items.map((i) => i.productId);
      const products = await tx.product.findMany({
        where: {
          id: { in: productIds },
          storeId: store.id,
          isActive: true,
          ...visible,
        },
        include: { variants: true },
      });
      const byId = new Map(products.map((p) => [p.id, p]));

      let subtotal = 0;
      const items: {
        productId: string;
        variantId: string | null;
        name: string;
        price: number;
        quantity: number;
      }[] = [];

      for (const item of dto.items) {
        const product = byId.get(item.productId);
        if (!product)
          throw new BadRequestException("Ba'zi mahsulotlar topilmadi");

        let name = product.name;
        let price = product.price;
        let variantId: string | null = null;

        if (product.variants.length > 0) {
          // Variantli mahsulot: variant tanlanishi shart, ombor variantniki
          const variant = product.variants.find((v) => v.id === item.variantId);
          if (!variant) {
            throw new BadRequestException(
              `"${product.name}" uchun variant tanlanmagan`,
            );
          }
          const updated = await tx.productVariant.updateMany({
            where: { id: variant.id, stock: { gte: item.quantity } },
            data: { stock: { decrement: item.quantity } },
          });
          if (updated.count === 0) {
            throw new BadRequestException(
              `"${product.name} — ${variant.name}" omborda yetarli emas`,
            );
          }
          name = `${product.name} — ${variant.name}`;
          price = variant.price ?? product.price;
          variantId = variant.id;
        } else {
          const updated = await tx.product.updateMany({
            where: { id: product.id, stock: { gte: item.quantity } },
            data: { stock: { decrement: item.quantity } },
          });
          if (updated.count === 0) {
            throw new BadRequestException(
              `"${product.name}" omborda yetarli emas`,
            );
          }
        }

        subtotal += price * item.quantity;
        items.push({
          productId: product.id,
          variantId,
          name,
          price,
          quantity: item.quantity,
        });
      }

      const last = await tx.order.findFirst({
        where: { storeId: store.id },
        orderBy: { number: "desc" },
        select: { number: true },
      });

      return tx.order.create({
        data: {
          number: (last?.number ?? 1000) + 1,
          storeId: store.id,
          paymentMethod: dto.paymentMethod,
          customerName: dto.customerName,
          phone: dto.phone,
          address: dto.address,
          note: dto.note,
          subtotal,
          deliveryFee: store.deliveryFee,
          total: subtotal + store.deliveryFee,
          items: { create: items },
        },
        include: { items: true },
      });
    });

    let payment: { paymentId: string; redirectUrl?: string } | null = null;
    if (dto.paymentMethod === "ONLINE_MOCK") {
      payment = await this.payments.getProvider("mock").createPayment(order);
    }

    // Sotuvchiga Telegram orqali xabar — javobni kutmaymiz, xato bo'lsa logga yoziladi
    this.prisma.store
      .findUnique({
        where: { id: store.id },
        select: { name: true, telegramBotToken: true, telegramChatId: true },
      })
      .then((s) => s && this.telegram.notifyNewOrder(s, order))
      .catch(() => undefined);

    return {
      orderId: order.id,
      number: order.number,
      total: order.total,
      payment,
    };
  }

  /** Xaridor buyurtmasini raqam + telefon orqali kuzatadi. */
  async trackOrder(slug: string, number: number, phone: string) {
    const store = await this.getStore(slug);
    if (!Number.isInteger(number) || phoneKey(phone).length < 7) {
      throw new NotFoundException("Buyurtma topilmadi");
    }
    const order = await this.prisma.order.findUnique({
      where: { storeId_number: { storeId: store.id, number } },
      select: { id: true, phone: true },
    });
    if (!order || phoneKey(order.phone) !== phoneKey(phone)) {
      throw new NotFoundException(
        "Bunday raqam va telefon bilan buyurtma topilmadi",
      );
    }
    return this.getOrder(slug, order.id);
  }

  /** Buyurtma tasdiqlash sahifasi uchun (cheklangan maydonlar). */
  async getOrder(slug: string, orderId: string) {
    const store = await this.getStore(slug);
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, storeId: store.id },
      select: {
        id: true,
        number: true,
        status: true,
        paymentStatus: true,
        paymentMethod: true,
        customerName: true,
        subtotal: true,
        deliveryFee: true,
        total: true,
        createdAt: true,
        items: {
          select: { name: true, price: true, quantity: true },
        },
        payments: {
          select: { id: true, provider: true, status: true },
        },
      },
    });
    if (!order) throw new NotFoundException("Buyurtma topilmadi");
    return order;
  }
}
