# LYNKO-X — O'zbekiston uchun e-commerce SaaS platformasi

Shopify modelidagi multi-tenant platforma: har bir savdogar o'z onlayn-do'konini ochadi.

## Arxitektura

Modular monolith, TypeScript monorepo (pnpm workspaces):

```
apps/
  api/          NestJS backend (port 4000) — auth, katalog, buyurtmalar, to'lovlar
  admin/        Next.js — do'kon egasi paneli (port 3000), uz/ru
  storefront/   Next.js — xaridor vitrinasi (port 3001), /{store-slug}
packages/
  db/           Prisma sxema + migratsiyalar + seed (PostgreSQL)
```

## Talablar

- Node.js 20+, pnpm 9+
- PostgreSQL (lokal, `lynko_dev` bazasi)

## Ishga tushirish

```bash
pnpm install
pnpm db:generate     # Prisma klientni yaratish
pnpm db:migrate      # migratsiyalar
pnpm db:seed         # demo do'kon va mahsulotlar
pnpm dev             # uchala ilova birga ishga tushadi
```

Manzillar:

- Admin panel: http://localhost:3000 — demo login: `demo@lynko-x.uz` / `demo1234`
- Demo do'kon: http://localhost:3001/demo
- API: http://localhost:4000

## To'lovlar

`apps/api/src/payments/` — provayder-adapter arxitekturasi:

- `mock` — test rejimi (hozir ishlaydi, pul o'tmaydi)
- `payme`, `click` — skelet tayyor; merchant hisob ochilgach kalitlar
  qo'shilib, callback endpointlar yoziladi (fayllar ichida yo'riqnoma bor)

## Keyingi bosqichlar (rejada)

- [x] Rasm yuklash (`POST /uploads`, fayllar `apps/api/uploads/` da saqlanadi)
- [x] Mahsulot variantlari (rang/o'lcham, har biriga alohida narx va ombor)
- [ ] Payme/Click haqiqiy integratsiya
- [ ] SMS/Telegram bildirishnomalar
- [ ] Custom domenlar + subdomen routing
- [ ] Tariflar va billing (SaaS monetizatsiya)
