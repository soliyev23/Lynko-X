import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PLAN_LIMITS, effectivePlan } from "../common/plans";
import { slugify } from "../common/slugify";
import { PrismaService } from "../prisma/prisma.service";
import { StoresService } from "../stores/stores.service";
import { CreateCategoryDto, CreateProductDto, UpdateProductDto } from "./dto";

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stores: StoresService,
  ) {}

  async list(userId: string, search?: string) {
    const store = await this.stores.getStoreForUser(userId);
    return this.prisma.product.findMany({
      where: {
        storeId: store.id,
        ...(search
          ? { name: { contains: search, mode: "insensitive" as const } }
          : {}),
      },
      include: {
        category: true,
        variants: { orderBy: { sortOrder: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getOne(userId: string, id: string) {
    const store = await this.stores.getStoreForUser(userId);
    const product = await this.prisma.product.findFirst({
      where: { id, storeId: store.id },
      include: {
        category: true,
        variants: { orderBy: { sortOrder: "asc" } },
      },
    });
    if (!product) throw new NotFoundException("Mahsulot topilmadi");
    return product;
  }

  async create(userId: string, dto: CreateProductDto) {
    const store = await this.stores.getStoreForUser(userId);

    // Tarif limiti: FREE 10, BASIC 100, PRO cheksiz (muddati o'tgan pullik tarif = FREE)
    const plan = effectivePlan(store);
    const limit = PLAN_LIMITS[plan];
    const count = await this.prisma.product.count({
      where: { storeId: store.id },
    });
    if (count >= limit) {
      throw new ForbiddenException(
        `${plan} tarifida ko'pi bilan ${limit} ta mahsulot qo'shish mumkin. Tarifni oshiring.`,
      );
    }

    const slug = await this.uniqueSlug(store.id, dto.name);
    const { variants, ...data } = dto;
    return this.prisma.product.create({
      data: {
        ...data,
        images: data.images ?? [],
        slug,
        storeId: store.id,
        ...(variants?.length
          ? {
              variants: {
                create: variants.map((v, i) => ({
                  name: v.name,
                  price: v.price ?? null,
                  stock: v.stock,
                  sortOrder: i,
                })),
              },
            }
          : {}),
      },
      include: { variants: { orderBy: { sortOrder: "asc" } } },
    });
  }

  async update(userId: string, id: string, dto: UpdateProductDto) {
    await this.getOne(userId, id); // egalikni tekshiradi
    const { variants, ...data } = dto;
    return this.prisma.$transaction(async (tx) => {
      await tx.product.update({ where: { id }, data });
      if (variants) {
        // O'chirilganlar yo'qotiladi, mavjudlar yangilanadi, yangilari qo'shiladi
        const keepIds = variants
          .map((v) => v.id)
          .filter((v): v is string => Boolean(v));
        await tx.productVariant.deleteMany({
          where: { productId: id, id: { notIn: keepIds } },
        });
        for (const [i, v] of variants.entries()) {
          const values = {
            name: v.name,
            price: v.price ?? null,
            stock: v.stock,
            sortOrder: i,
          };
          if (v.id) {
            await tx.productVariant.updateMany({
              where: { id: v.id, productId: id },
              data: values,
            });
          } else {
            await tx.productVariant.create({
              data: { ...values, productId: id },
            });
          }
        }
      }
      return tx.product.findUniqueOrThrow({
        where: { id },
        include: {
          category: true,
          variants: { orderBy: { sortOrder: "asc" } },
        },
      });
    });
  }

  async remove(userId: string, id: string) {
    await this.getOne(userId, id);
    await this.prisma.product.delete({ where: { id } });
    return { ok: true };
  }

  // ---- Kategoriyalar ----

  async listCategories(userId: string) {
    const store = await this.stores.getStoreForUser(userId);
    return this.prisma.category.findMany({
      where: { storeId: store.id },
      include: { _count: { select: { products: true } } },
      orderBy: { name: "asc" },
    });
  }

  async createCategory(userId: string, dto: CreateCategoryDto) {
    const store = await this.stores.getStoreForUser(userId);
    const slug = slugify(dto.name);
    if (!slug) throw new BadRequestException("Kategoriya nomi yaroqsiz");
    const exists = await this.prisma.category.findUnique({
      where: { storeId_slug: { storeId: store.id, slug } },
    });
    if (exists) throw new BadRequestException("Bu kategoriya allaqachon bor");
    return this.prisma.category.create({
      data: { name: dto.name, slug, storeId: store.id },
    });
  }

  async removeCategory(userId: string, id: string) {
    const store = await this.stores.getStoreForUser(userId);
    const category = await this.prisma.category.findFirst({
      where: { id, storeId: store.id },
    });
    if (!category) throw new NotFoundException("Kategoriya topilmadi");
    await this.prisma.category.delete({ where: { id } });
    return { ok: true };
  }

  private async uniqueSlug(storeId: string, name: string) {
    const base = slugify(name) || "mahsulot";
    let slug = base;
    for (let i = 2; ; i++) {
      const exists = await this.prisma.product.findUnique({
        where: { storeId_slug: { storeId, slug } },
      });
      if (!exists) return slug;
      slug = `${base}-${i}`;
    }
  }
}
