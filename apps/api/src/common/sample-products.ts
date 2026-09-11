import { Prisma } from "@lynko-x/db";

// Yangi do'kon ochilganda unga 5 ta namuna mahsulot qo'shiladi —
// sotuvchi panelni va vitrinani bo'sh holatda emas, tayyor misolda sinab ko'radi.
// Rasmlar API'ning /assets/samples/ manzilidan beriladi (tashqi xizmatga bog'liq emas).

const SAMPLE_CATEGORY = { name: "Namunalar", slug: "namunalar" };

interface SampleProduct {
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice?: number;
  stock: number;
  image: string;
  variants?: { name: string; stock: number; price?: number }[];
}

export const SAMPLE_PRODUCTS: SampleProduct[] = [
  {
    name: "Oq futbolka (namuna)",
    slug: "namuna-futbolka",
    description:
      "Bu namuna mahsulot. Uni tahrirlang yoki o'chirib, o'z mahsulotlaringizni qo'shing. 100% paxta, klassik bichim.",
    price: 89000,
    comparePrice: 119000,
    stock: 25,
    image: "tshirt.svg",
    variants: [
      { name: "S", stock: 6 },
      { name: "M", stock: 9 },
      { name: "L", stock: 7 },
      { name: "XL", stock: 3, price: 99000 },
    ],
  },
  {
    name: "Krossovka (namuna)",
    slug: "namuna-krossovka",
    description:
      "Namuna mahsulot: yengil sport krossovka. Narx, ombor qoldig'i va rasmni o'zingizga moslab o'zgartiring.",
    price: 349000,
    stock: 12,
    image: "sneaker.svg",
  },
  {
    name: "Ryukzak 20L (namuna)",
    slug: "namuna-ryukzak",
    description:
      "Namuna mahsulot: kundalik ryukzak, noutbuk bo'limi bilan. Tavsifni xohlagancha tahrirlashingiz mumkin.",
    price: 199000,
    comparePrice: 249000,
    stock: 8,
    image: "backpack.svg",
  },
  {
    name: "Qo'l soati (namuna)",
    slug: "namuna-soat",
    description:
      "Namuna mahsulot: klassik qo'l soati. Ombor qoldig'i kam bo'lganda panel sizni ogohlantiradi.",
    price: 459000,
    stock: 3,
    image: "watch.svg",
  },
  {
    name: "Simsiz quloqchin (namuna)",
    slug: "namuna-quloqchin",
    description:
      "Namuna mahsulot: simsiz quloqchin, 30 soat ish vaqti. Buyurtma berib, panelda qanday ko'rinishini sinab ko'ring.",
    price: 279000,
    stock: 15,
    image: "headphones.svg",
  },
];

export async function createSampleProducts(
  tx: Prisma.TransactionClient,
  storeId: string,
) {
  const base = process.env.PUBLIC_URL ?? "http://localhost:4000";
  const category = await tx.category.create({
    data: { storeId, ...SAMPLE_CATEGORY },
  });
  for (const p of SAMPLE_PRODUCTS) {
    await tx.product.create({
      data: {
        storeId,
        categoryId: category.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        comparePrice: p.comparePrice,
        stock: p.stock,
        images: [`${base}/assets/samples/${p.image}`],
        variants: p.variants
          ? {
              create: p.variants.map((v, i) => ({
                name: v.name,
                stock: v.stock,
                price: v.price,
                sortOrder: i,
              })),
            }
          : undefined,
      },
    });
  }
}
