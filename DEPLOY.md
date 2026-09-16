# LYNKO-X — test serverga joylash (Oracle Cloud)

Server: Oracle Cloud Ampere A1 (ARM, 2 OCPU, 12 GB), Oracle Linux 9. Domen: **lynkox.uz**.

| Nima | Manzil |
|---|---|
| Bosh sahifa (marketing) | https://lynkox.uz |
| Do'kon vitrinasi | https://lynkox.uz/{slug} (masalan `/demo`) |
| Admin-panel | https://admin.lynkox.uz |
| API | https://api.lynkox.uz |

## Serverdagi tuzilma

- Tizim useri `lynkox`, loyiha `/srv/lynko-x/app` (GitHub `main` branch'ining kloni).
- Uchta systemd xizmati: `lynko-api` (:4000), `lynko-admin` (:3000), `lynko-storefront` (:3001).
  Next.js xizmatlari `node .../next/dist/bin/next start` orqali ishga tushadi (SELinux `/srv` ichidagi
  shell-skriptni bevosita ishga tushirishga ruxsat bermaydi).
- Reverse-proxy: Caddy (`/etc/caddy/Caddyfile`), HTTPS sertifikatlar Let's Encrypt'dan avtomatik.
- PostgreSQL 16, baza `lynko`, foydalanuvchi `lynkox` (parol `/srv/lynko-x/CREDENTIALS.txt`).
- Muhit fayllari (git'da yo'q): `apps/api/.env`, `packages/db/.env`, `apps/admin/.env.production`,
  `apps/storefront/.env.production`. `NEXT_PUBLIC_*` qiymatlari build paytida kodga kiradi —
  o'zgartirilsa admin va vitrina qayta build qilinadi.
- Firewall: serverda `firewalld` (http, https, ssh) va Oracle konsolida Security List (80, 443, 22).

## Yangilash

```bash
ssh oracle-test
sudo -u lynkox /srv/lynko-x/deploy.sh   # git pull → install → prisma migrate deploy → build → restart
```

## Zaxira

`/srv/lynko-x/backup.sh` har kuni 03:00 da (`lynkox` cron'i): baza dump (`pg_dump`, custom format)
va yuklangan rasmlar arxivi `/srv/lynko-x/backups/` ga, 14 kun saqlanadi.

Tiklash: `pg_restore --clean --no-owner -d "$DATABASE_URL" db_YYYY-MM-DD_HHMM.dump`.

## Loglar

```bash
sudo journalctl -u lynko-api -f
sudo journalctl -u lynko-admin -f
sudo journalctl -u lynko-storefront -f
sudo journalctl -u caddy -f
```
