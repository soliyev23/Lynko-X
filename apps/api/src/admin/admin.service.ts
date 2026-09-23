import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import { Prisma } from "@lynko-x/db";
import { PrismaService } from "../prisma/prisma.service";
import {
  fillCounts,
  fillDays,
  planUsage,
  storeAnalytics,
} from "../common/analytics";
import {
  EXPIRING_SOON_DAYS,
  PLANS,
  PLAN_PRICES,
  addDays,
  addMonths,
  effectivePlan,
  subscriptionInfo,
} from "../common/plans";
import { AddPlanPaymentDto, AdminUpdateStoreDto, CreateAdminDto, CreateNoteDto, UpdateAdminDto } from "./dto";
import { AuditService } from "../audit/audit.service";
import { AuthUser, effectiveAdminRole } from "../auth/jwt-auth.guard";

const SUB_SELECT = {
  id: true,
  plan: true,
  planExpiresAt: true,
  isTrial: true,
  isActive: true,
  blockReason: true,
  blockedAt: true,
} as const;

const PAGE = 30;

/** Ro'yxatlarda do'kon haqida qisqa ma'lumot */
const STORE_BRIEF = {
  id: true,
  name: true,
  slug: true,
  logoUrl: true,
  phone: true,
  plan: true,
  planExpiresAt: true,
  isTrial: true,
  isActive: true,
  blockReason: true,
  blockedAt: true,
  createdAt: true,
  owner: { select: { name: true, email: true } },
  _count: { select: { products: true, orders: true } },
} as const;

/** LYNKO-X platforma egasi uchun: barcha do'konlar, sotuvchilar va tahlil. */
@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  private actorOf(user: AuthUser) {
    return { userId: user.userId, email: user.email, role: user.adminRole ?? user.role };
  }

  private async ensureStore(id: string) {
    const store = await this.prisma.store.findUnique({ where: { id } });
    if (!store) throw new NotFoundException("Do'kon topilmadi");
    return store;
  }

  /**
   * Buyurtma qidiruvi: telefon (raqamlar bo'yicha, formatdan qat'i nazar),
   * buyurtma raqami (#1001) yoki xaridor nomi. Mos kelgan id'lar qaytadi.
   */
  private async searchOrderIds(search: string, storeId?: string): Promise<string[]> {
    const s = search.trim();
    const digits = s.replace(/\D/g, "");
    const num = /^#?(\d{1,9})$/.exec(s);
    const rows = await this.prisma.$queryRaw<{ id: string }[]>(Prisma.sql`
      SELECT id FROM "Order"
      WHERE (${storeId ?? null}::text IS NULL OR "storeId" = ${storeId ?? null})
        AND (
          "customerName" ILIKE ${"%" + s + "%"}
          OR (${digits.length >= 4} AND regexp_replace(phone, '[^0-9]', '', 'g') LIKE ${"%" + digits + "%"})
          OR (${num != null} AND number = ${num ? Number(num[1]) : -1})
        )
      ORDER BY "createdAt" DESC
      LIMIT 500`);
    return rows.map((r) => r.id);
  }

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

  /** Platforma bo'yicha vaqt qatorlari va taqsimotlar (so'nggi 30 kun). */
  async analytics() {
    const [daily, newStores, planRows, statusRows, topStores, activeRows, windows] =
      await Promise.all([
        this.prisma.$queryRaw<{ day: Date; orders: number; revenue: number }[]>(
          Prisma.sql`
            SELECT date_trunc('day', "createdAt")::date AS day,
                   count(*)::int AS orders,
                   coalesce(sum(total), 0)::float8 AS revenue
            FROM "Order"
            WHERE status <> 'CANCELLED'
              AND "createdAt" >= now() - interval '30 days'
            GROUP BY 1 ORDER BY 1`,
        ),
        this.prisma.$queryRaw<{ day: Date; count: number }[]>(Prisma.sql`
            SELECT date_trunc('day', "createdAt")::date AS day, count(*)::int AS count
            FROM "Store"
            WHERE "createdAt" >= now() - interval '30 days'
            GROUP BY 1 ORDER BY 1`),
        this.prisma.store.findMany({
          select: { plan: true, planExpiresAt: true, isTrial: true },
        }),
        this.prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
        this.prisma.$queryRaw<
          { id: string; name: string; slug: string; plan: string; orders: number; revenue: number }[]
        >(Prisma.sql`
            SELECT s.id, s.name, s.slug, s.plan::text AS plan,
                   count(o.id)::int AS orders,
                   coalesce(sum(o.total), 0)::float8 AS revenue
            FROM "Store" s
            LEFT JOIN "Order" o ON o."storeId" = s.id AND o.status <> 'CANCELLED'
            GROUP BY s.id
            ORDER BY revenue DESC, orders DESC
            LIMIT 10`),
        this.prisma.$queryRaw<{ count: number }[]>(Prisma.sql`
            SELECT count(DISTINCT "storeId")::int AS count
            FROM "Order"
            WHERE "createdAt" >= now() - interval '7 days'`),
        this.prisma.$queryRaw<{ period: string; orders: number; revenue: number; stores: number }[]>(
          Prisma.sql`
            SELECT CASE WHEN "createdAt" >= now() - interval '30 days'
                        THEN 'current' ELSE 'previous' END AS period,
                   count(*)::int AS orders,
                   coalesce(sum(total), 0)::float8 AS revenue,
                   count(DISTINCT "storeId")::int AS stores
            FROM "Order"
            WHERE status <> 'CANCELLED'
              AND "createdAt" >= now() - interval '60 days'
            GROUP BY 1`,
        ),
      ]);

    const current = windows.find((w) => w.period === "current");
    const previous = windows.find((w) => w.period === "previous");

    return {
      daily: fillDays(daily),
      newStores: fillCounts(newStores),
      planBreakdown: PLANS.map((plan) => ({
        plan,
        count: planRows.filter((s) => effectivePlan(s) === plan).length,
      })),
      statusBreakdown: statusRows.map((r) => ({
        status: r.status,
        count: r._count._all,
      })),
      topStores,
      activeStores7d: activeRows[0]?.count ?? 0,
      period: {
        orders30: current?.orders ?? 0,
        revenue30: current?.revenue ?? 0,
        sellingStores30: current?.stores ?? 0,
        ordersPrev30: previous?.orders ?? 0,
        revenuePrev30: previous?.revenue ?? 0,
      },
    };
  }

  async listStores(search?: string) {
    const stores = await this.prisma.store.findMany({
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
        planExpiresAt: true,
        isTrial: true,
        theme: true,
        isActive: true,
        phone: true,
        createdAt: true,
        owner: { select: { id: true, name: true, email: true } },
        _count: { select: { products: true, orders: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return stores.map((s) => ({ ...s, subscription: subscriptionInfo(s) }));
  }

  /** Do'konning to'liq kartasi: ma'lumotlari, egasi, tahlili, mahsulotlari. */
  async getStore(id: string) {
    const store = await this.prisma.store.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, email: true, createdAt: true } },
        _count: { select: { products: true, orders: true, categories: true } },
      },
    });
    if (!store) throw new NotFoundException("Do'kon topilmadi");

    const [analytics, payments, products, notes] = await Promise.all([
      storeAnalytics(this.prisma, id),
      this.prisma.planPayment.findMany({
        where: { storeId: id },
        orderBy: { paidAt: "desc" },
        take: 50,
        include: { createdBy: { select: { name: true } } },
      }),
      this.prisma.product.findMany({
        where: { storeId: id },
        take: 100,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          stock: true,
          isActive: true,
          images: true,
          createdAt: true,
          category: { select: { name: true } },
          variants: { select: { name: true, stock: true, price: true } },
        },
      }),
      this.prisma.storeNote.findMany({
        where: { storeId: id },
        orderBy: { createdAt: "desc" },
        take: 50,
        include: { author: { select: { id: true, name: true } } },
      }),
    ]);

    // Bot tokeni platforma egasiga ham ko'rsatilmaydi — faqat ulanganligi
    const { telegramBotToken, telegramChatId, ...safe } = store;
    return {
      store: {
        ...safe,
        telegramConfigured: Boolean(telegramBotToken && telegramChatId),
      },
      usage: planUsage(store, store._count.products),
      subscription: subscriptionInfo(store),
      analytics,
      products,
      payments,
      notes,
    };
  }

  /**
   * Do'konni o'zgartirish. Tarif va muddat: Bosh admin yoki Moliya;
   * bloklash: Bosh admin yoki Support. Har bir o'zgarish jurnalga yoziladi.
   */
  async updateStore(id: string, dto: AdminUpdateStoreDto, user: AuthUser) {
    const store = await this.prisma.store.findUnique({ where: { id } });
    if (!store) throw new NotFoundException("Do'kon topilmadi");
    const role = effectiveAdminRole(user);
    const wantsBilling = dto.plan !== undefined || dto.planExpiresAt !== undefined || dto.isTrial !== undefined;
    const wantsSupport = dto.isActive !== undefined;
    if (wantsBilling && !["OWNER", "FINANCE"].includes(role))
      throw new ForbiddenException("Tarif va muddatni faqat Bosh admin yoki Moliya o'zgartiradi");
    if (wantsSupport && !["OWNER", "SUPPORT"].includes(role))
      throw new ForbiddenException("Bloklashni faqat Bosh admin yoki Support qiladi");

    const data: Prisma.StoreUpdateInput = {};
    if (dto.isActive !== undefined) {
      data.isActive = dto.isActive;
      if (dto.isActive) {
        data.blockReason = null;
        data.blockedAt = null;
      } else {
        data.blockReason = dto.blockReason?.trim() || null;
        data.blockedAt = new Date();
      }
    }
    if (dto.plan !== undefined) {
      data.plan = dto.plan;
      if (dto.plan === "FREE") {
        data.planExpiresAt = null;
        data.isTrial = false;
      }
    }
    if (dto.planExpiresAt !== undefined)
      data.planExpiresAt = dto.planExpiresAt ? new Date(dto.planExpiresAt) : null;
    if (dto.isTrial !== undefined) data.isTrial = dto.isTrial;
    const updated = await this.prisma.store.update({
      where: { id },
      data,
      select: SUB_SELECT,
    });

    const actor = this.actorOf(user);
    if (dto.isActive !== undefined && dto.isActive !== store.isActive) {
      await this.audit.log(actor, {
        action: dto.isActive ? "store.unblocked" : "store.blocked",
        entity: "store",
        entityId: id,
        storeId: id,
        meta: dto.isActive ? {} : { reason: updated.blockReason },
      });
    }
    if (dto.plan !== undefined && dto.plan !== store.plan) {
      await this.audit.log(actor, { action: "plan.changed", entity: "store", entityId: id, storeId: id, meta: { from: store.plan, to: dto.plan } });
    }
    if (dto.planExpiresAt !== undefined) {
      await this.audit.log(actor, { action: "expiry.changed", entity: "store", entityId: id, storeId: id, meta: { from: store.planExpiresAt, to: updated.planExpiresAt } });
    }
    if (dto.isTrial !== undefined && dto.isTrial !== store.isTrial) {
      await this.audit.log(actor, { action: "trial.changed", entity: "store", entityId: id, storeId: id, meta: { to: dto.isTrial } });
    }
    return { ...updated, subscription: subscriptionInfo(updated) };
  }

  /**
   * Qo'lda to'lov: yozuv saqlanadi va do'kon tarifi/muddati yangilanadi.
   * Xuddi shu pullik tarif hali tugamagan bo'lsa (sinov emas), yangi davr
   * eski muddat oxiridan boshlanadi; aks holda hozirdan.
   */
  async addPayment(storeId: string, dto: AddPlanPaymentDto, user: AuthUser) {
    const store = await this.prisma.store.findUnique({ where: { id: storeId } });
    if (!store) throw new NotFoundException("Do'kon topilmadi");
    const now = new Date();
    const paidAt = dto.paidAt ? new Date(dto.paidAt) : now;
    const continues =
      store.plan === dto.plan &&
      !store.isTrial &&
      store.planExpiresAt != null &&
      store.planExpiresAt.getTime() > now.getTime();
    const periodStart = continues ? (store.planExpiresAt as Date) : now;
    const periodEnd = addMonths(periodStart, dto.months);
    const [payment, updated] = await this.prisma.$transaction([
      this.prisma.planPayment.create({
        data: {
          storeId,
          plan: dto.plan,
          amount: dto.amount,
          method: dto.method,
          months: dto.months,
          paidAt,
          periodStart,
          periodEnd,
          note: dto.note?.trim() || null,
          createdById: user.userId,
        },
        include: { createdBy: { select: { name: true } } },
      }),
      this.prisma.store.update({
        where: { id: storeId },
        data: { plan: dto.plan, planExpiresAt: periodEnd, isTrial: false },
        select: SUB_SELECT,
      }),
    ]);
    await this.audit.log(this.actorOf(user), {
      action: "payment.added",
      entity: "payment",
      entityId: payment.id,
      storeId,
      meta: { plan: dto.plan, amount: dto.amount, months: dto.months, method: dto.method, periodEnd },
    });
    return { payment, store: { ...updated, subscription: subscriptionInfo(updated) } };
  }

  /** Xato yozilgan to'lovni o'chirish. Muddat avtomatik qayta hisoblanmaydi — admin qo'lda to'g'rilaydi. */
  async deletePayment(storeId: string, paymentId: string, user: AuthUser) {
    const payment = await this.prisma.planPayment.findFirst({
      where: { id: paymentId, storeId },
    });
    if (!payment) throw new NotFoundException("To'lov topilmadi");
    await this.prisma.planPayment.delete({ where: { id: paymentId } });
    await this.audit.log(this.actorOf(user), {
      action: "payment.deleted",
      entity: "payment",
      entityId: paymentId,
      storeId,
      meta: { plan: payment.plan, amount: payment.amount, paidAt: payment.paidAt },
    });
    return { ok: true };
  }

  /** Obuna va to'lovlar bo'yicha umumiy ko'rinish (owner-panel "To'lovlar" sahifasi). */
  async billing() {
    const now = new Date();
    const soon = addDays(now, EXPIRING_SOON_DAYS);
    const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11, 1));
    const [paidStores, totalStores, monthRows, allTime, recentPayments] =
      await Promise.all([
        this.prisma.store.findMany({
          where: { plan: { not: "FREE" } },
          select: {
            id: true,
            name: true,
            slug: true,
            phone: true,
            plan: true,
            planExpiresAt: true,
            isTrial: true,
            owner: { select: { name: true, email: true } },
          },
        }),
        this.prisma.store.count(),
        this.prisma.$queryRaw<{ month: Date; amount: number; count: number }[]>(
          Prisma.sql`
            SELECT date_trunc('month', "paidAt") AS month,
                   COALESCE(SUM(amount), 0)::float8 AS amount,
                   COUNT(*)::int AS count
            FROM "PlanPayment"
            WHERE "paidAt" >= ${from}
            GROUP BY 1 ORDER BY 1`,
        ),
        this.prisma.planPayment.aggregate({ _sum: { amount: true }, _count: { _all: true } }),
        this.prisma.planPayment.findMany({
          orderBy: { paidAt: "desc" },
          take: 30,
          include: {
            store: { select: { id: true, name: true, slug: true } },
            createdBy: { select: { name: true } },
          },
        }),
      ]);

    const subs = paidStores.map((s) => ({ ...s, subscription: subscriptionInfo(s, now) }));
    const trial = subs.filter((s) => s.subscription.status === "TRIAL").length;
    const active = subs.filter((s) => s.subscription.status === "ACTIVE").length;
    const expired = subs.filter((s) => s.subscription.status === "EXPIRED");
    const expiringSoon = subs
      .filter((s) => {
        const e = s.subscription.expiresAt;
        return e != null && e.getTime() > now.getTime() && e.getTime() <= soon.getTime();
      })
      .sort((a, b) => a.subscription.expiresAt!.getTime() - b.subscription.expiresAt!.getTime());

    // So'nggi 12 oy, bo'sh oylar 0 bilan
    const byMonth = new Map(
      monthRows.map((r) => [new Date(r.month).toISOString().slice(0, 7), r]),
    );
    const months: { month: string; amount: number; count: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
      const key = d.toISOString().slice(0, 7);
      const row = byMonth.get(key);
      months.push({ month: key, amount: row?.amount ?? 0, count: row?.count ?? 0 });
    }
    const thisMonth = months[months.length - 1]?.amount ?? 0;
    const lastMonth = months[months.length - 2]?.amount ?? 0;

    return {
      totals: {
        thisMonth,
        lastMonth,
        allTime: allTime._sum.amount ?? 0,
        paymentsCount: allTime._count._all,
        trial,
        active,
        expired: expired.length,
        free: totalStores - paidStores.length,
        stores: totalStores,
      },
      months,
      expiringSoon,
      expired: expired.sort(
        (a, b) => b.subscription.expiresAt!.getTime() - a.subscription.expiresAt!.getTime(),
      ),
      recentPayments,
      prices: PLAN_PRICES,
    };
  }

  listUsers(search?: string) {
    return this.prisma.user.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          }
        : undefined,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        stores: {
          select: {
            id: true,
            slug: true,
            name: true,
            plan: true,
            isActive: true,
            _count: { select: { orders: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  // ================= Do'kon ichki sahifalari =================

  async listStoreOrders(storeId: string, q: { status?: string; search?: string; page?: number }) {
    await this.ensureStore(storeId);
    const page = Math.max(1, Number(q.page) || 1);
    const where: Prisma.OrderWhereInput = { storeId };
    if (q.status) where.status = q.status as Prisma.EnumOrderStatusFilter["equals"];
    if (q.search?.trim()) where.id = { in: await this.searchOrderIds(q.search, storeId) };
    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * PAGE,
        take: PAGE,
        select: {
          id: true, number: true, customerName: true, phone: true, total: true,
          status: true, paymentStatus: true, paymentMethod: true, createdAt: true,
          _count: { select: { items: true } },
        },
      }),
      this.prisma.order.count({ where }),
    ]);
    return { items, total, page, pages: Math.max(1, Math.ceil(total / PAGE)) };
  }

  async getStoreOrder(storeId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, storeId },
      include: {
        items: { include: { product: { select: { slug: true } } } },
        payments: { orderBy: { createdAt: "desc" } },
        store: { select: { id: true, name: true, slug: true } },
      },
    });
    if (!order) throw new NotFoundException("Buyurtma topilmadi");
    return order;
  }

  async listStoreProducts(storeId: string, q: { search?: string; page?: number }) {
    await this.ensureStore(storeId);
    const page = Math.max(1, Number(q.page) || 1);
    const where: Prisma.ProductWhereInput = { storeId };
    if (q.search?.trim()) where.name = { contains: q.search.trim(), mode: "insensitive" };
    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * PAGE,
        take: PAGE,
        select: {
          id: true, name: true, slug: true, price: true, stock: true, isActive: true,
          images: true, createdAt: true,
          category: { select: { name: true } },
          variants: { select: { name: true, stock: true, price: true } },
        },
      }),
      this.prisma.product.count({ where }),
    ]);
    return { items, total, page, pages: Math.max(1, Math.ceil(total / PAGE)) };
  }

  // ---------- Ichki izohlar ----------

  async listNotes(storeId: string) {
    await this.ensureStore(storeId);
    return this.prisma.storeNote.findMany({
      where: { storeId },
      orderBy: { createdAt: "desc" },
      include: { author: { select: { id: true, name: true } } },
    });
  }

  async addNote(storeId: string, dto: CreateNoteDto, user: AuthUser) {
    await this.ensureStore(storeId);
    const note = await this.prisma.storeNote.create({
      data: { storeId, authorId: user.userId, text: dto.text.trim() },
      include: { author: { select: { id: true, name: true } } },
    });
    await this.audit.log(this.actorOf(user), {
      action: "note.added", entity: "note", entityId: note.id, storeId,
      meta: { preview: note.text.slice(0, 80) },
    });
    return note;
  }

  async deleteNote(storeId: string, noteId: string, user: AuthUser) {
    const note = await this.prisma.storeNote.findFirst({ where: { id: noteId, storeId } });
    if (!note) throw new NotFoundException("Izoh topilmadi");
    await this.prisma.storeNote.delete({ where: { id: noteId } });
    await this.audit.log(this.actorOf(user), { action: "note.deleted", entity: "note", entityId: noteId, storeId });
    return { ok: true };
  }

  /** Voqealar tarixi: jurnal yozuvlari; ro'yxatdan o'tish yozuvi bo'lmasa sanadan yasaladi */
  async storeEvents(storeId: string) {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
      select: { createdAt: true, owner: { select: { email: true } } },
    });
    if (!store) throw new NotFoundException("Do'kon topilmadi");
    const events: Array<{
      id: string; action: string; actorEmail: string; actorRole: string;
      actor: { id: string; name: string } | null; meta: unknown; createdAt: Date;
    }> = await this.audit.forStore(storeId);
    if (!events.some((e) => e.action === "store.registered")) {
      events.push({
        id: "registered",
        action: "store.registered",
        actorEmail: store.owner.email,
        actorRole: "MERCHANT",
        actor: null,
        meta: null,
        createdAt: store.createdAt,
      });
    }
    return events.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // ================= E'tibor talab qiladi =================

  async attention() {
    const now = new Date();
    const in3 = addDays(now, 3);
    const weekAgo = addDays(now, -7);
    const [trialEnding, expired, noOwnProducts, blocked] = await Promise.all([
      this.prisma.store.findMany({
        where: { isTrial: true, planExpiresAt: { gt: now, lte: in3 } },
        select: STORE_BRIEF,
        orderBy: { planExpiresAt: "asc" },
        take: 50,
      }),
      this.prisma.store.findMany({
        where: { plan: { not: "FREE" }, planExpiresAt: { lt: now } },
        select: STORE_BRIEF,
        orderBy: { planExpiresAt: "desc" },
        take: 50,
      }),
      // 7 kundan katta, faol, lekin namunalardan boshqa mahsuloti yo'q
      this.prisma.store.findMany({
        where: {
          isActive: true,
          createdAt: { lt: weekAgo },
          products: { none: { OR: [{ categoryId: null }, { category: { slug: { not: "namunalar" } } }] } },
        },
        select: STORE_BRIEF,
        orderBy: { createdAt: "asc" },
        take: 50,
      }),
      this.prisma.store.findMany({
        where: { isActive: false },
        select: STORE_BRIEF,
        orderBy: { blockedAt: "desc" },
        take: 50,
      }),
    ]);
    const withSub = (rows: typeof trialEnding) => rows.map((s) => ({ ...s, subscription: subscriptionInfo(s, now) }));
    return {
      trialEnding: withSub(trialEnding),
      expired: withSub(expired),
      noOwnProducts: withSub(noOwnProducts),
      blocked: withSub(blocked),
    };
  }

  // ================= Global buyurtma qidiruvi =================

  async searchOrders(q: { search?: string; status?: string; page?: number }) {
    const page = Math.max(1, Number(q.page) || 1);
    const where: Prisma.OrderWhereInput = {};
    if (q.status) where.status = q.status as Prisma.EnumOrderStatusFilter["equals"];
    if (q.search?.trim()) where.id = { in: await this.searchOrderIds(q.search) };
    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * PAGE,
        take: PAGE,
        select: {
          id: true, number: true, customerName: true, phone: true, total: true,
          status: true, paymentStatus: true, createdAt: true,
          store: { select: { id: true, name: true, slug: true } },
        },
      }),
      this.prisma.order.count({ where }),
    ]);
    return { items, total, page, pages: Math.max(1, Math.ceil(total / PAGE)) };
  }

  // ================= Jamoa (adminlar) =================

  listAdmins() {
    return this.prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true, name: true, email: true, adminRole: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    });
  }

  async createAdmin(dto: CreateAdminDto, user: AuthUser) {
    const taken = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (taken) throw new BadRequestException("Bu email allaqachon ro'yxatdan o'tgan");
    const created = await this.prisma.user.create({
      data: {
        name: dto.name.trim(),
        email: dto.email.toLowerCase(),
        passwordHash: await bcrypt.hash(dto.password, 10),
        role: "ADMIN",
        adminRole: dto.adminRole,
      },
      select: { id: true, name: true, email: true, adminRole: true, createdAt: true },
    });
    await this.audit.log(this.actorOf(user), {
      action: "admin.created", entity: "admin", entityId: created.id,
      meta: { email: created.email, adminRole: created.adminRole },
    });
    return created;
  }

  async updateAdmin(id: string, dto: UpdateAdminDto, user: AuthUser) {
    const target = await this.prisma.user.findFirst({ where: { id, role: "ADMIN" } });
    if (!target) throw new NotFoundException("Admin topilmadi");
    if (id === user.userId && dto.adminRole !== "OWNER")
      throw new BadRequestException("O'z huquqingizni pasaytira olmaysiz");
    const updated = await this.prisma.user.update({
      where: { id },
      data: { adminRole: dto.adminRole },
      select: { id: true, name: true, email: true, adminRole: true, createdAt: true },
    });
    await this.audit.log(this.actorOf(user), {
      action: "admin.role_changed", entity: "admin", entityId: id,
      meta: { email: updated.email, from: target.adminRole, to: dto.adminRole },
    });
    return updated;
  }

  async removeAdmin(id: string, user: AuthUser) {
    if (id === user.userId) throw new BadRequestException("O'zingizni olib tashlay olmaysiz");
    const target = await this.prisma.user.findFirst({ where: { id, role: "ADMIN" } });
    if (!target) throw new NotFoundException("Admin topilmadi");
    await this.prisma.user.delete({ where: { id } });
    await this.audit.log(this.actorOf(user), {
      action: "admin.removed", entity: "admin", entityId: id, meta: { email: target.email },
    });
    return { ok: true };
  }
}
