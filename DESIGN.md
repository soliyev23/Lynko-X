# LYNKO-X dizayn tizimi

Bu hujjat admin-panel va bosh sahifa uchun. Sotuvchilarning vitrinalari alohida: ular shablon
palitrasi va sotuvchining o'z brend rangi bilan ishlaydi, platforma rangi ularga majburlanmaydi.

## Ranglar

Tokenlar `apps/admin/src/app/globals.css` va `apps/storefront/src/app/globals.css` boshidagi
`@theme` blokida. Hex faqat shu yerda, logotip, favicon va shablon registrida yoziladi.
Komponentlarda faqat token klasslari: `bg-primary-600`, `text-success-700`, `border-gray-200`.

| Oila | Vazifa | Asosiy qiymatlar |
|---|---|---|
| `primary` | Brend, firuza (Samarqand koshinlari) | 600 `#0E7C7B` tugma va link, 700 hover, 800 active, 50 och fon |
| `accent` | Faqat eng muhim CTA (amber) | 500 `#F2A93B`, matn har doim to'q `text-gray-900` |
| `gray` | Neytral: fon, matn, chegara | sahifa `#F8FAFC`, matn 900, ikkilamchi 600, chegara 200 |
| `success` `error` `warning` `info` | Holatlar, brenddan alohida | badge: 100 fon + 700 matn; 600 faqat ikonka |

Qoidalar:
- **60 / 30 / 10**: neytral fon, neytral matn va struktura, brend rangi. Firuza faqat asosiy
  tugma, aktiv navigatsiya, link, fokus halqasi va logotipda.
- **Bitta ekranda bitta primary tugma.** Qolganlari `secondary` (outline) yoki `ghost`.
- **Kontrast WCAG AA**: matn 4.5:1, katta matn va UI 3:1. Oq matn faqat primary 600 va undan
  to'q tonlarda. Amber ustida oq matn taqiqlangan.
- Success va primary yonma-yon qo'yilmaydi (farqi kam).

## Dark rejim

Admin: `<html class="dark">`, `localStorage.lynkox_admin_theme`, sidebar'dagi tugma. Sahifalar
`gray-*` klasslarda yozilgani uchun qorong'i rejimda kulrang shkala `.dark { --color-gray-* }`
bilan teskari qiymatlarga o'tadi, `bg-white` kartalar `--surface-card` bo'ladi, primary 600
tugma foni 400 tonga va matni to'qqa o'tadi. Yangi kodda ham shu klasslar ishlatiladi, alohida
`dark:` variantlar kerak emas. Bosh sahifa o'z tugmasi bilan `dark:` variantlarda yozilgan.

## Shriftlar

- `font-display` = Manrope: logotip so'z belgisi, h1–h3 (admin'da global qoida), landing
  sarlavhalari. Og'irlik 700–800, `tracking -0.02em`.
- Matn: tizim shrifti (admin), Inter (landing). Raqamlar jadvalda `tabular-nums`.

## Logotip

«Bog'lanish» belgisi: ikki yumaloq chiziq (sotuvchi va xaridor) bitta nuqtada tutashadi.
Komponentlar: `Logo` va `LogoMark` (`components/Logo.tsx`, ikkala ilovada bir xil).
`tone="dark"` qorong'i fon uchun (sidebar). So'z belgisi `lynko-x` kichik harf, Manrope,
`-x` brend rangida. Favicon va ilova ikonkasi: `app/icon.svg` (firuza kvadrat, och L, oq nuqta).
Matnda brend nomi har doim `LYNKO-X`.

## Komponentlar (`apps/admin/src/components`)

- `ui.tsx`: `Button` (`primary | secondary | accent | danger | ghost`, `sm | md | lg`),
  `ButtonLink`, `Badge`, `Input`, `Field`, `Alert`. Yangi sahifalar tugmani shu yerdan oladi.
- `EmptyState.tsx`: `EmptyState` va jadval uchun `EmptyRow`. Turlari: products, orders, stores,
  users, generic. Har birida chiziqli illyustratsiya, sarlavha, izoh va keyingi qadam tugmasi.
- `badges.tsx`: buyurtma, to'lov va obuna holat badge'lari.
- `charts.tsx`: `Panel`, `StatTile`, `BarChart`, `HBars`, `Meter`. Ranglar tokenlardan.
- `ThemePreview.tsx`: vitrina shablonlari preview'i, namuna rasmlar `public/samples`, sotuvchi
  brend rangi bilan.
- `icons.tsx`: 24px chiziqli ikonkalar, `stroke="currentColor"`. Emoji ishlatilmaydi.

## Bosh sahifa

- Hero: `accent` tugma bitta («Do'kon ochish»), header tugmasi ikkilamchi. Ostida haqiqiy
  mahsulot: admin-panel skrinshoti brauzer ramkasida, vitrina telefonda
  (`public/landing/admin-dashboard.png`, `public/landing/store-mobile.png`). Skrinshotlar demo
  do'kondan olinadi va dizayn o'zgarganda yangilanadi.
- Fon naqshi: `.lp-grid`, girih uslubidagi sakkiz qirrali yulduzlar panjarasi, juda nozik.
