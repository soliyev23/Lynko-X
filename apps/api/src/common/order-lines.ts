import { BadRequestException } from "@nestjs/common";
import { Prisma } from "@lynko-x/db";

/** Buyurtma qatori: tanlangan mahsulot (variant) va soni. */
export interface LineInput {
  productId: string;
  variantId?: string | null;
  quantity: number;
}

/** Serverda hisoblangan qator: nom, narx va qoldiq bazadan olinadi. */
export interface ResolvedLine {
  productId: string;
  variantId: string | null;
  name: string;
  variantName: string | null;
  price: number;
  quantity: number;
  image: string | null;
  stock: number;
}

type Db = Prisma.TransactionClient;

/** Tugallanmagan xarid deb hisoblash uchun faolliksiz o'tishi kerak bo'lgan vaqt. */
export function abandonedAfterMs(): number {
  return (Number(process.env.ABANDONED_AFTER_MINUTES) || 30) * 60_000;
}

/** Telefon raqamini solishtirish uchun: faqat raqamlar, oxirgi 9 tasi. */
export function phoneKey(phone: string): string {
  return phone.replace(/\D/g, "").slice(-9);
}

async function loadProducts(
  db: Db,
  storeId: string,
  lines: LineInput[],
  productWhere?: Prisma.ProductWhereInput,
) {
  const products = await db.product.findMany({
    where: {
      AND: [
        { id: { in: lines.map((l) => l.productId) }, storeId },
        productWhere ?? {},
      ],
    },
    include: { variants: true },
  });
  return new Map(products.map((p) => [p.id, p]));
}

/**
 * Qatorlarni bazadagi mahsulotlar bilan solishtiradi. Ombor kamaytirilmaydi
 * (qoralama va checkout sessiyasi uchun). `strict` rejimda topilmagan mahsulot
 * yoki variant xato beradi, aks holda bunday qator tashlab ketiladi.
 */
export async function resolveLines(
  db: Db,
  storeId: string,
  lines: LineInput[],
  opts: { productWhere?: Prisma.ProductWhereInput; strict?: boolean } = {},
): Promise<ResolvedLine[]> {
  const byId = await loadProducts(db, storeId, lines, opts.productWhere);
  const out: ResolvedLine[] = [];
  for (const line of lines) {
    const product = byId.get(line.productId);
    if (!product) {
      if (opts.strict)
        throw new BadRequestException("Ba'zi mahsulotlar topilmadi");
      continue;
    }
    const base = {
      productId: product.id,
      name: product.name,
      quantity: line.quantity,
      image: product.images[0] ?? null,
    };
    if (product.variants.length > 0) {
      const variant = product.variants.find((v) => v.id === line.variantId);
      if (!variant) {
        if (opts.strict) {
          throw new BadRequestException(
            `"${product.name}" uchun variant tanlanmagan`,
          );
        }
        continue;
      }
      out.push({
        ...base,
        variantId: variant.id,
        variantName: variant.name,
        price: variant.price ?? product.price,
        stock: variant.stock,
      });
    } else {
      out.push({
        ...base,
        variantId: null,
        variantName: null,
        price: product.price,
        stock: product.stock,
      });
    }
  }
  return out;
}

export interface CreateOrderInput {
  storeId: string;
  lines: LineInput[];
  /** Qo'shimcha mahsulot filtri (vitrinada: faol va tarif bo'yicha ko'rinadigan). */
  productWhere?: Prisma.ProductWhereInput;
  customerName: string;
  phone: string;
  address?: string | null;
  note?: string | null;
  deliveryFee: number;
  paymentMethod: "CASH_ON_DELIVERY" | "ONLINE_MOCK";
  /** Sotuvchi to'lovni qabul qilib bo'lgan (qoralamadan yaratilganda). */
  paid?: boolean;
}

/**
 * Buyurtma yaratadi (tranzaksiya ichida chaqiriladi). Narxlar va ombor qoldig'i
 * FAQAT serverda tekshiriladi. Ombor `updateMany ... stock >= qty` bilan
 * kamaytiriladi: ikki xaridor bir vaqtda oxirgi donani olishidan himoya.
 */
export async function createOrderInTx(tx: Db, input: CreateOrderInput) {
  const byId = await loadProducts(
    tx,
    input.storeId,
    input.lines,
    input.productWhere,
  );

  let subtotal = 0;
  const items: {
    productId: string;
    variantId: string | null;
    name: string;
    price: number;
    quantity: number;
  }[] = [];

  for (const line of input.lines) {
    const product = byId.get(line.productId);
    if (!product) throw new BadRequestException("Ba'zi mahsulotlar topilmadi");

    let name = product.name;
    let price = product.price;
    let variantId: string | null = null;

    if (product.variants.length > 0) {
      // Variantli mahsulot: variant tanlanishi shart, ombor variantniki
      const variant = product.variants.find((v) => v.id === line.variantId);
      if (!variant) {
        throw new BadRequestException(
          `"${product.name}" uchun variant tanlanmagan`,
        );
      }
      const updated = await tx.productVariant.updateMany({
        where: { id: variant.id, stock: { gte: line.quantity } },
        data: { stock: { decrement: line.quantity } },
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
        where: { id: product.id, stock: { gte: line.quantity } },
        data: { stock: { decrement: line.quantity } },
      });
      if (updated.count === 0) {
        throw new BadRequestException(`"${product.name}" omborda yetarli emas`);
      }
    }

    subtotal += price * line.quantity;
    items.push({
      productId: product.id,
      variantId,
      name,
      price,
      quantity: line.quantity,
    });
  }

  const last = await tx.order.findFirst({
    where: { storeId: input.storeId },
    orderBy: { number: "desc" },
    select: { number: true },
  });

  return tx.order.create({
    data: {
      number: (last?.number ?? 1000) + 1,
      storeId: input.storeId,
      paymentMethod: input.paymentMethod,
      paymentStatus: input.paid ? "PAID" : "PENDING",
      customerName: input.customerName,
      phone: input.phone,
      address: input.address ?? null,
      note: input.note ?? null,
      subtotal,
      deliveryFee: input.deliveryFee,
      total: subtotal + input.deliveryFee,
      items: { create: items },
    },
    include: { items: true },
  });
}
