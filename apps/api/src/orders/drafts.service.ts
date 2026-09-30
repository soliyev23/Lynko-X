import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { createOrderInTx, resolveLines } from "../common/order-lines";
import { PrismaService } from "../prisma/prisma.service";
import { StoresService } from "../stores/stores.service";
import { CompleteDraftDto, SaveDraftDto } from "./dto";

const INCLUDE = {
  items: true,
  order: { select: { id: true, number: true } },
} as const;

type DraftRow = {
  deliveryFee: number;
  items: { price: number; quantity: number }[];
};

/** Qoralamaga hisoblangan summalarni qo'shadi. */
function withTotals<T extends DraftRow>(draft: T) {
  const subtotal = draft.items.reduce((s, i) => s + i.price * i.quantity, 0);
  return { ...draft, subtotal, total: subtotal + draft.deliveryFee };
}

function clean(value?: string) {
  const v = value?.trim();
  return v ? v : null;
}

/**
 * Qoralamalar: sotuvchi qo'lda kiritadigan buyurtmalar (telefon yoki chat orqali
 * kelgan). Qoralama omborga ta'sir qilmaydi; "yakunlash" haqiqiy buyurtma yaratadi.
 */
@Injectable()
export class DraftsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stores: StoresService,
  ) {}

  async list(userId: string, status?: string) {
    const store = await this.stores.getStoreForUser(userId);
    const drafts = await this.prisma.draftOrder.findMany({
      where: {
        storeId: store.id,
        ...(status === "OPEN" || status === "COMPLETED" ? { status } : {}),
      },
      include: INCLUDE,
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    return drafts.map(withTotals);
  }

  private async find(userId: string, id: string) {
    const store = await this.stores.getStoreForUser(userId);
    const draft = await this.prisma.draftOrder.findFirst({
      where: { id, storeId: store.id },
      include: INCLUDE,
    });
    if (!draft) throw new NotFoundException("Qoralama topilmadi");
    return { store, draft };
  }

  async getOne(userId: string, id: string) {
    const { draft } = await this.find(userId, id);
    return withTotals(draft);
  }

  /** Mahsulot nomi va narxi bazadan olinadi (mijoz yuborgan narxga ishonilmaydi). */
  private async itemsFor(storeId: string, dto: SaveDraftDto) {
    const lines = await resolveLines(this.prisma, storeId, dto.items, {
      strict: true,
    });
    return lines.map((l) => ({
      productId: l.productId,
      variantId: l.variantId,
      name: l.name,
      variantName: l.variantName,
      price: l.price,
      quantity: l.quantity,
      image: l.image,
    }));
  }

  async create(userId: string, dto: SaveDraftDto) {
    const store = await this.stores.getStoreForUser(userId);
    const items = await this.itemsFor(store.id, dto);
    const last = await this.prisma.draftOrder.findFirst({
      where: { storeId: store.id },
      orderBy: { number: "desc" },
      select: { number: true },
    });
    const draft = await this.prisma.draftOrder.create({
      data: {
        number: (last?.number ?? 0) + 1,
        storeId: store.id,
        customerName: clean(dto.customerName),
        phone: clean(dto.phone),
        address: clean(dto.address),
        note: clean(dto.note),
        deliveryFee: dto.deliveryFee ?? store.deliveryFee,
        items: { create: items },
      },
      include: INCLUDE,
    });
    return withTotals(draft);
  }

  async update(userId: string, id: string, dto: SaveDraftDto) {
    const { store, draft } = await this.find(userId, id);
    if (draft.status !== "OPEN") {
      throw new BadRequestException(
        "Yakunlangan qoralamani o'zgartirib bo'lmaydi",
      );
    }
    const items = await this.itemsFor(store.id, dto);
    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.draftOrderItem.deleteMany({ where: { draftId: id } });
      return tx.draftOrder.update({
        where: { id },
        data: {
          customerName: clean(dto.customerName),
          phone: clean(dto.phone),
          address: clean(dto.address),
          note: clean(dto.note),
          deliveryFee: dto.deliveryFee ?? draft.deliveryFee,
          items: { create: items },
        },
        include: INCLUDE,
      });
    });
    return withTotals(updated);
  }

  async remove(userId: string, id: string) {
    await this.find(userId, id);
    await this.prisma.draftOrder.delete({ where: { id } });
    return { ok: true };
  }

  /** Qoralamadan haqiqiy buyurtma yaratadi: ombor kamayadi, raqam beriladi. */
  async complete(userId: string, id: string, dto: CompleteDraftDto) {
    const { store, draft } = await this.find(userId, id);
    if (draft.status !== "OPEN") {
      throw new BadRequestException("Bu qoralama allaqachon yakunlangan");
    }
    if (draft.items.length === 0) {
      throw new BadRequestException("Kamida bitta mahsulot qo'shing");
    }
    const customerName = draft.customerName?.trim() ?? "";
    const phone = draft.phone?.trim() ?? "";
    if (customerName.length < 2 || phone.replace(/\D/g, "").length < 7) {
      throw new BadRequestException(
        "Buyurtma yaratish uchun xaridor ismi va telefonini kiriting",
      );
    }

    const order = await this.prisma.$transaction(async (tx) => {
      const created = await createOrderInTx(tx, {
        storeId: store.id,
        lines: draft.items,
        customerName,
        phone,
        address: draft.address,
        note: draft.note,
        deliveryFee: draft.deliveryFee,
        paymentMethod: "CASH_ON_DELIVERY",
        paid: dto.paid,
      });
      await tx.draftOrder.update({
        where: { id },
        data: {
          status: "COMPLETED",
          orderId: created.id,
          completedAt: new Date(),
        },
      });
      return created;
    });
    return { orderId: order.id, number: order.number };
  }
}
