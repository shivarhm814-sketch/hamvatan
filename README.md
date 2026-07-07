# مجموعه اسماعیلی — پلتفرم املاک و خدمات اداری/ثبتی

مونوریپوی این پروژه شامل سه پوشه است:

```
design_handoff_esmaeili_site/   منبع طراحی (HTML reference) — منبع حقیقت طراحی
backend/                        NestJS + Prisma + PostgreSQL + Redis + BullMQ
frontend/                       Next.js 14 (App Router) + TypeScript + Tailwind
```

## راه‌اندازی سریع

### ۱. زیرساخت (Postgres + Redis)
```bash
cd backend
cp .env.example .env
docker compose up -d
```

### ۲. Backend
```bash
cd backend
npm install
npx prisma migrate dev --name init
npx prisma db seed
npm run start:dev
```
API روی `http://localhost:3000/api/v1` بالا می‌آید. تست سلامت: `GET /api/v1/health`.

> **دسترسی به پنل مدیریت**: برای اینکه اولین کاربر ADMIN را داشته باشید، مقدار `ADMIN_MOBILE` را در
> `.env` با شماره موبایل خودتان پر کنید، سپس `npx prisma db seed` را اجرا کنید. بعد از آن با همان شماره
> از طریق `/login` وارد شوید تا به مسیرهای `/admin/*` دسترسی پیدا کنید.

### ۳. Frontend
```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```
سایت روی `http://localhost:3002` بالا می‌آید (پورت ۳۰۰۱ عمداً استفاده نشد چون معمولاً توسط
Docker Desktop / WSL روی ویندوز اشغال است).

## معماری
- **Backend**: مونولیت ماژولار NestJS (`auth`, `users`, `properties`, `admin-service-requests`,
  `contact-requests`, `notifications`, `storage`, `sms`, `health`) با Dependency Inversion برای
  سرویس‌های خارجی (SMS، Object Storage) پشت Symbol Tokenها.
- **احراز هویت**: ورود بدون رمز عبور با OTP پیامکی (Redis برای TTL/تلاش‌ها) + JWT.
- **صف پیام**: BullMQ روی Redis برای ارسال ناهمگام پیامک با retry و ثبت در `MessageLog`.
- **ذخیره‌سازی فایل**: Object Storage سازگار با S3 (پیش‌فرض آروان‌کلود) با نام‌گذاری UUID.
- **Frontend**: صفحات عمومی (خانه، آگهی‌ها، بررسی رایگان مدارک، پیگیری پرونده، تماس، درباره ما) با
  Server Components + ISR، و پنل مدیریت (`/admin/*`) محافظت‌شده با JWT در middleware.

## تست‌ها و CI
- تست واحد: `npm run test` در `backend/`
- تست E2E: `npm run test:e2e` در `backend/` (نیازمند Postgres + Redis در حال اجرا)
- CI: `.github/workflows/ci.yml` — lint + migrate + test + e2e + build روی هر push/PR به شاخه `main`
  که مسیر `backend/**` را تغییر داده باشد.

## یادداشت مهم محیط توسعه
کد کامل پروژه (Sprint ۱ تا ۶ طبق `esmaeili-full-project-prompt.md`) در این مخزن نوشته شده است. در محیطی
که این کد تولید شد، دسترسی شبکه به `registry.npmjs.org` مسدود بود و بنابراین `npm install` واقعی اجرا
نشد — یعنی build/test به‌صورت زنده تأیید نشده‌اند. پیش از استقرار، حتماً در محیطی با اینترنت این مراحل را
اجرا کنید:

```bash
cd backend && npm install && npx prisma generate && npx prisma migrate dev && npm run lint && npm run test && npm run test:e2e && npm run build
cd ../frontend && npm install && npm run lint && npm run build
```

جزئیات موارد باز امنیتی/عملیاتی در [SPRINT6_CHECKLIST.md](./SPRINT6_CHECKLIST.md) آمده است.
