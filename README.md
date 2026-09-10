# LYNKO-X — O'zbekiston uchun e-commerce SaaS platformasi

Shopify modelidagi multi-tenant platforma: har bir savdogar o'z onlayn-do'konini ochadi,
LYNKO-X jamoasi esa platforma admin-panelidan barcha do'konlarni boshqaradi.

## Arxitektura

Modular monolith, TypeScript monorepo (pnpm workspaces):

```
apps/
  api/          NestJS backend (port 4000)
                auth · stores · products (+variants, kategoriyalar) · orders · payments
                storefront (ommaviy API) · uploads · admin (platforma) · notifications (Telegram)
  admin/        Next.js — boshqaruv paneli (port 3000), uz/ru
                /            sotuvchi: dashboard, mahsulotlar, buyurtmalar, sozlamalar
                /platform    LYNKO-X admini: statistika, do'konlar, foydalanuvchilar
  storefront/   Next.js — (port 3001)
                /            marketing bosh sahifa (imkoniyatlar, tariflar, ro'yxatdan o'tish)
                /{slug}      do'kon vitrinasi: katalog, qidiruv, savat, checkout, kuzatish
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
pnpm db:seed         # demo do'kon, mahsulotlar va platforma admini
pnpm dev             # uchala ilova birga ishga tushadi
```

Manzillar va hisoblar:

| Nima | Manzil | Login |
|---|---|---|
| Bosh sahifa (marketing) | http://localhost:3001 | — |
| Demo do'kon | http://localhost:3001/demo | — |
| Sotuvchi paneli | http://localhost:3000 | `demo@lynko-x.uz` / `demo1234` |
| Platforma admin-paneli | http://localhost:3000/platform | `admin@lynko-x.uz` / `admin1234` |
| API | http://localhost:4000 | — |

## Asosiy imkoniyatlar

- **Sotuvchi**: ro'yxatdan o'tish = do'kon ochish; mahsulotlar (rasm yuklash, kategoriyalar,
  rang/o'lcham variantlari — har biriga alohida narx va ombor); buyurtmalar holati;
  do'kon sozlamalari; Telegram-bildirishnomalar (o'z boti orqali)
- **Dizayn shablonlari** (`/design`): 5 ta tayyor ko'rinish — Classic, Minimal, Bold (qorong'i),
  Elegant (serif), Market (yon panelli katalog). Har biri o'z palitrasi, shrifti, hero-bo'limi
  va kartochka uslubiga ega; banner yuklash; o'zgarish vitrinada darhol ko'rinadi.
  Shablon registri: `apps/storefront/src/lib/themes.ts` (yangi shablon = bitta obyekt)
- **Xaridor**: katalog, qidiruv, sahifalash, variant tanlash, savat, checkout (naqd yoki
  test-onlayn), buyurtmani raqam + telefon orqali kuzatish; SEO meta-teglar
- **Platforma admini**: umumiy statistika, barcha do'konlar (tarifni o'zgartirish,
  bloklash/faollashtirish, qidiruv), foydalanuvchilar ro'yxati
- **Tariflar**: FREE (10 mahsulot) · BASIC (100) · PRO (cheksiz) — limit serverda tekshiriladi
- **Xavfsizlik**: JWT, rolga asoslangan guard'lar, helmet, rate-limit (120 so'rov/daqiqa),
  narx va ombor faqat serverda hisoblanadi (race-condition himoyasi)

## To'lovlar

`apps/api/src/payments/` — provayder-adapter arxitekturasi:

- `mock` — test rejimi (hozir ishlaydi, pul o'tmaydi)
- `payme`, `click` — skelet tayyor; merchant hisob ochilgach kalitlar
  qo'shilib, callback endpointlar yoziladi (fayllar ichida yo'riqnoma bor)

## Keyingi bosqichlar

- [x] Rasm yuklash
- [x] Mahsulot variantlari
- [x] Telegram bildirishnomalar
- [x] Platforma admin-paneli
- [x] Tariflar (limitlar) va marketing sahifa
- [x] Qidiruv, sahifalash, SEO, buyurtma kuzatish
- [ ] Payme/Click haqiqiy integratsiya (merchant hisob kerak)
- [ ] Kuryer/yetkazib berish xizmatlari integratsiyasi
- [ ] Tarif to'lovi (billing) — to'lov tizimi ulangach
- [ ] Custom domenlar + subdomen routing (deploy bilan birga)
- [ ] Deploy: VPS + Caddy (auto-SSL), rasmlar uchun obyekt-xotira
- [ ] Avtomatik testlar (checkout/ombor mantig'i)
