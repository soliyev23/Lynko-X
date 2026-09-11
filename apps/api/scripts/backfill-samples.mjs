// Mahsuloti yo'q mavjud do'konlarga 5 ta namuna mahsulot qo'shadi (bir martalik, xavfsiz qayta ishga tushirish mumkin).
// Ishga tushirish (apps/api ichida, avval `pnpm build`): pnpm samples:backfill
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { prisma } = require("@lynko-x/db");
const { createSampleProducts } = require("../dist/common/sample-products.js");

const stores = await prisma.store.findMany({
  where: { products: { none: {} }, categories: { none: { slug: "namunalar" } } },
  select: { id: true, slug: true, name: true },
});
if (stores.length === 0) console.log("Bo'sh do'konlar yo'q — hech narsa qilinmadi.");
for (const s of stores) {
  await prisma.$transaction((tx) => createSampleProducts(tx, s.id));
  console.log(`+ ${s.slug} (${s.name}): 5 ta namuna mahsulot qo'shildi`);
}
await prisma.$disconnect();
