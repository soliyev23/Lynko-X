import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@lynko-x/db";
import { TelegramService } from "../notifications/telegram.service";
import { PaymentsService } from "../payments/payments.service";
import { PrismaService } from "../prisma/prisma.service";
import { CheckoutDto, CheckoutSessionDto } from "./dto";
import {
  abandonedAfterMs,
  createOrderInTx,
  phoneKey,
  resolveLines,
  type LineInput,
} from "../common/order-lines";
import {
  effectivePlan,
  planLimit,
  type SubscriptionSource,
} from "../common/plans";

const PAGE_SIZE = 24;

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
        brandColor: true,
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

    const order = await this.prisma.$transaction((tx) =>
      createOrderInTx(tx, {
        storeId: store.id,
        lines: dto.items,
        productWhere: { isActive: true, ...visible },
        customerName: dto.customerName,
        phone: dto.phone,
        address: dto.address,
        note: dto.note,
        deliveryFee: store.deliveryFee,
        paymentMethod: dto.paymentMethod,
      }),
    );

    // Shu xaridorning ochiq checkout sessiyalari yopiladi (tugallanmagan xaridlar ro'yxati uchun)
    await this.finishSessions(store.id, dto.checkoutToken, dto.phone, order.id).catch(
      () => undefined,
    );

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

  /**
   * Checkout sessiyasi: xaridor telefonini kiritganda savat serverda saqlanadi.
   * Buyurtma berilmasa, ma'lum vaqtdan keyin sotuvchiga "tugallanmagan xarid"
   * sifatida ko'rinadi. Token xaridor brauzerida turadi; tiklash havolasi ham shu.
   */
  async saveSession(slug: string, dto: CheckoutSessionDto) {
    const store = await this.findStore(slug);
    const key = phoneKey(dto.phone);
    if (key.length < 9) {
      throw new BadRequestException("Telefon raqami to'liq emas");
    }
    const lines = await resolveLines(this.prisma, store.id, dto.items, {
      productWhere: { isActive: true, ...(await this.visibleFilter(store)) },
    });
    if (lines.length === 0) throw new BadRequestException("Savat bo'sh");
    const items = lines.map(({ stock, ...line }) => {
      void stock;
      return line;
    });
    const data = {
      customerName: dto.customerName?.trim() || null,
      phone: dto.phone.trim(),
      phoneKey: key,
      address: dto.address?.trim() || null,
      items: items as unknown as Prisma.InputJsonValue,
      subtotal: lines.reduce((s, l) => s + l.price * l.quantity, 0),
    };
    const existing = dto.token
      ? await this.prisma.checkoutSession.findFirst({
          where: { token: dto.token, storeId: store.id, completedAt: null },
        })
      : null;
    if (existing) {
      // Uzoq tanaffusdan keyin qaytgan bo'lsa, "tashlab ketilgan" belgisi saqlanib qoladi
      const idle =
        Date.now() - existing.updatedAt.getTime() > abandonedAfterMs();
      await this.prisma.checkoutSession.update({
        where: { id: existing.id },
        data: { ...data, ...(idle ? { wasAbandoned: true } : {}) },
      });
      return { token: existing.token };
    }
    const created = await this.prisma.checkoutSession.create({
      data: { storeId: store.id, ...data },
      select: { token: true },
    });
    return { token: created.token };
  }

  /** Tiklash havolasi: savat va kontaktlar qaytariladi (faqat hozir sotuvda bor mahsulotlar). */
  async getSession(slug: string, token: string) {
    const store = await this.findStore(slug);
    const session = await this.prisma.checkoutSession.findFirst({
      where: { token, storeId: store.id, completedAt: null },
    });
    if (!session) throw new NotFoundException("Savat topilmadi");
    const saved = session.items as unknown as LineInput[];
    const lines = await resolveLines(this.prisma, store.id, saved, {
      productWhere: { isActive: true, ...(await this.visibleFilter(store)) },
    });
    await this.prisma.checkoutSession.update({
      where: { id: session.id },
      data: {
        wasAbandoned: true,
        recoveryOpenedAt: session.recoveryOpenedAt ?? new Date(),
      },
    });
    return {
      customerName: session.customerName,
      phone: session.phone,
      address: session.address,
      items: lines
        .filter((l) => l.stock > 0)
        .map((l) => ({ ...l, quantity: Math.min(l.quantity, l.stock) })),
    };
  }

  /**
   * Buyurtma berilgach shu token yoki shu telefon bilan ochiq sessiyalar yopiladi.
   * Tashlab ketilgan sessiya "tiklangan" deb belgilanadi, qolganlari o'chiriladi.
   */
  private async finishSessions(
    storeId: string,
    token: string | undefined,
    phone: string,
    orderId: string,
  ) {
    const key = phoneKey(phone);
    const open = await this.prisma.checkoutSession.findMany({
      where: {
        storeId,
        completedAt: null,
        OR: [...(token ? [{ token }] : []), ...(key ? [{ phoneKey: key }] : [])],
      },
    });
    if (open.length === 0) return;
    const primary = open.find((s) => s.token === token) ?? open[0];
    const wasAbandoned =
      primary.wasAbandoned ||
      primary.recoveryOpenedAt != null ||
      Date.now() - primary.updatedAt.getTime() > abandonedAfterMs();
    const others = open.filter((s) => s.id !== primary.id).map((s) => s.id);
    await this.prisma.$transaction([
      ...(others.length
        ? [this.prisma.checkoutSession.deleteMany({ where: { id: { in: others } } })]
        : []),
      wasAbandoned
        ? this.prisma.checkoutSession.update({
            where: { id: primary.id },
            data: { completedAt: new Date(), recovered: true, orderId },
          })
        : this.prisma.checkoutSession.delete({ where: { id: primary.id } }),
    ]);
  }
}
