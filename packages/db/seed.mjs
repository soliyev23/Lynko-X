// Demo ma'lumotlar: demo do'kon, kategoriyalar, mahsulotlar.
// Ishga tushirish: pnpm db:seed (root'dan)
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import bcrypt from "bcryptjs";

const dir = dirname(fileURLToPath(import.meta.url));
for (const line of readFileSync(join(dir, ".env"), "utf8").split("\n")) {
  const m = line.match(/^([A-Z_]+)="?([^"]*)"?$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}

const { PrismaClient } = await import("./client/index.js");
const prisma = new PrismaClient();

const DEMO_EMAIL = "demo@lynko-x.uz";
const ADMIN_EMAIL = "admin@lynko-x.uz";

// LYNKO-X platforma administratori (do'koni yo'q, /platform bo'limini ko'radi)
if (!(await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } }))) {
  await prisma.user.create({
    data: {
      email: ADMIN_EMAIL,
      name: "LYNKO-X Admin",
      role: "ADMIN",
      adminRole: "OWNER",
      passwordHash: await bcrypt.hash("admin1234", 10),
    },
  });
  console.log("Platforma admini yaratildi: admin@lynko-x.uz / admin1234");
}

const existing = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } });
if (existing) {
  console.log("Demo ma'lumotlar allaqachon mavjud — o'tkazib yuborildi.");
  process.exit(0);
}

const user = await prisma.user.create({
  data: {
    email: DEMO_EMAIL,
    name: "Demo Sotuvchi",
    passwordHash: await bcrypt.hash("demo1234", 10),
  },
});

const store = await prisma.store.create({
  data: {
    slug: "demo",
    name: "Demo Do'kon",
    description: "LYNKO-X platformasidagi namunaviy do'kon — kiyim va aksessuarlar.",
    phone: "+998 90 123 45 67",
    telegram: "lynkox_demo",
    deliveryFee: 20000,
    theme: "classic",
    bannerUrl: "https://picsum.photos/seed/lynko-banner/1600/600",
    ownerId: user.id,
  },
});

const kiyim = await prisma.category.create({
  data: { storeId: store.id, name: "Kiyimlar", slug: "kiyimlar" },
});
const aksessuar = await prisma.category.create({
  data: { storeId: store.id, name: "Aksessuarlar", slug: "aksessuarlar" },
});

const products = [
  {
    name: "Oq futbolka Classic",
    slug: "oq-futbolka-classic",
    description: "100% paxta, yumshoq va nafas oladigan mato. O'lchamlar: S–XL.",
    price: 129000,
    comparePrice: 159000,
    stock: 42,
    categoryId: kiyim.id,
    images: ["https://picsum.photos/seed/lynko-tshirt/800/800"],
    variants: {
      create: [
        { name: "S", stock: 10, sortOrder: 0 },
        { name: "M", stock: 15, sortOrder: 1 },
        { name: "L", stock: 12, sortOrder: 2 },
        { name: "XL", stock: 5, price: 139000, sortOrder: 3 },
      ],
    },
  },
  {
    name: "Jinsi shim Slim Fit",
    slug: "jinsi-shim-slim-fit",
    description: "Zamonaviy kesim, chidamli denim mato.",
    price: 349000,
    stock: 18,
    categoryId: kiyim.id,
    images: ["https://picsum.photos/seed/lynko-jeans/800/800"],
  },
  {
    name: "Qishki kurtka Premium",
    slug: "qishki-kurtka-premium",
    description: "Issiq, suv o'tkazmaydigan qishki kurtka. -20°C gacha.",
    price: 899000,
    comparePrice: 1100000,
    stock: 7,
    categoryId: kiyim.id,
    images: ["https://picsum.photos/seed/lynko-jacket/800/800"],
  },
  {
    name: "Charm hamyon",
    slug: "charm-hamyon",
    description: "Tabiiy charmdan tikilgan klassik hamyon.",
    price: 189000,
    stock: 25,
    categoryId: aksessuar.id,
    images: ["https://picsum.photos/seed/lynko-wallet/800/800"],
  },
  {
    name: "Quyosh ko'zoynagi UV400",
    slug: "quyosh-kozoynagi-uv400",
    description: "UV400 himoya, polarizatsiyalangan linzalar.",
    price: 149000,
    stock: 0,
    categoryId: aksessuar.id,
    images: ["https://picsum.photos/seed/lynko-glasses/800/800"],
  },
  {
    name: "Sport sumka 30L",
    slug: "sport-sumka-30l",
    description: "Yengil va sig'imli sport sumkasi, alohida poyabzal bo'limi bilan.",
    price: 259000,
    stock: 12,
    categoryId: aksessuar.id,
    images: ["https://picsum.photos/seed/lynko-bag/800/800"],
  },
];

for (const p of products) {
  await prisma.product.create({ data: { ...p, storeId: store.id } });
}

console.log("Demo ma'lumotlar yaratildi:");
console.log("  Admin login: demo@lynko-x.uz / demo1234");
console.log("  Do'kon: http://localhost:3001/demo");
await prisma.$disconnect();
