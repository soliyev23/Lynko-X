import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PaymentsService } from "../payments/payments.service";
import { PrismaService } from "../prisma/prisma.service";
import { CheckoutDto } from "./dto";

@Injectable()
export class StorefrontService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly payments: PaymentsService,
  ) {}

  async getStore(slug: string) {
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
        currency: true,
        deliveryFee: true,
        isActive: true,
        categories: { select: { id: true, name: true, slug: true } },
      },
    });
    if (!store || !store.isActive)
      throw new NotFoundException("Do'kon topilmadi");
    return store;
  }

  async listProducts(slug: string, categorySlug?: string, search?: string) {
    const store = await this.getStore(slug);
    return this.prisma.product.findMany({
      where: {
        storeId: store.id,
        isActive: true,
        ...(categorySlug ? { category: { slug: categorySlug } } : {}),
        ...(search
          ? { name: { contains: search, mode: "insensitive" as const } }
          : {}),
      },
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
    });
  }

  async getProduct(slug: string, productSlug: string) {
    const store = await this.getStore(slug);
    const product = await this.prisma.product.findFirst({
      where: { storeId: store.id, slug: productSlug, isActive: true },
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
    const store = await this.getStore(slug);

    const order = await this.prisma.$transaction(async (tx) => {
      const productIds = dto.items.map((i) => i.productId);
      const products = await tx.product.findMany({
        where: { id: { in: productIds }, storeId: store.id, isActive: true },
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

    return {
      orderId: order.id,
      number: order.number,
      total: order.total,
      payment,
    };
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
