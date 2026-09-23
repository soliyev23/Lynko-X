import { Injectable } from "@nestjs/common";
import { Prisma } from "@lynko-x/db";
import { PrismaService } from "../prisma/prisma.service";

export interface AuditActor {
  userId: string | null;
  email: string;
  role: string; // OWNER | SUPPORT | FINANCE | MERCHANT | SYSTEM
}

export interface AuditEntry {
  action: string;
  entity: string;
  entityId?: string | null;
  storeId?: string | null;
  meta?: Record<string, unknown>;
}

export const PAGE_SIZE = 50;

/** Audit-jurnal: kim, qachon, nima qildi. Yozish xatosi asosiy amalni to'xtatmaydi. */
@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(actor: AuditActor, entry: AuditEntry) {
    try {
      await this.prisma.auditLog.create({
        data: {
          actorId: actor.userId,
          actorEmail: actor.email,
          actorRole: actor.role,
          action: entry.action,
          entity: entry.entity,
          entityId: entry.entityId ?? null,
          storeId: entry.storeId ?? null,
          meta: entry.meta ? (entry.meta as Prisma.InputJsonValue) : undefined,
        },
      });
    } catch (e) {
      console.error("Audit-jurnalga yozib bo'lmadi:", e);
    }
  }

  async list(params: { page?: number; storeId?: string; action?: string; search?: string }) {
    const page = Math.max(1, params.page ?? 1);
    const where: Prisma.AuditLogWhereInput = {};
    if (params.storeId) where.storeId = params.storeId;
    if (params.action) where.action = params.action;
    if (params.search) {
      where.OR = [
        { actorEmail: { contains: params.search, mode: "insensitive" } },
        { store: { name: { contains: params.search, mode: "insensitive" } } },
        { store: { slug: { contains: params.search, mode: "insensitive" } } },
      ];
    }
    const [items, total, actions] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        include: {
          actor: { select: { id: true, name: true } },
          store: { select: { id: true, name: true, slug: true } },
        },
      }),
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.findMany({ distinct: ["action"], select: { action: true }, orderBy: { action: "asc" } }),
    ]);
    return { items, total, page, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)), actions: actions.map((a) => a.action) };
  }

  /** Bitta do'konning voqealar tarixi */
  forStore(storeId: string, take = 100) {
    return this.prisma.auditLog.findMany({
      where: { storeId },
      orderBy: { createdAt: "desc" },
      take,
      include: { actor: { select: { id: true, name: true } } },
    });
  }
}
