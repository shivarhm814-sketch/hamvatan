# Sprint 6 Checklist — مجموعه اسماعیلی

## انجام‌شده در کد
- [x] تست‌های واحد: `AuthService`, `UsersService`, `SmsService`, `StorageService`, `PropertiesService`, `AdminServiceRequestsService`, `NotificationsProcessor`, `ContactRequestsService`, `RolesGuard`
- [x] تست E2E مسیر کامل OTP: شماره نامعتبر → ۴۰۰، درخواست → تأیید → JWT، کد اشتباه → ۴۰۱
- [x] `JWT_SECRET` حداقل ۳۲ کاراکتر در Joi validation (`env.validation.ts`)
- [x] Rate limit دوگانه OTP (IP از طریق ThrottlerGuard + شماره موبایل از طریق Redis) و پوشش در تست واحد
- [x] اعتبارسنجی فایل آپلودی (نوع/حجم/تعداد) در `file-upload.util.ts` و DTOها
- [x] Sentry در `main.ts` از طریق `SENTRY_DSN`
- [x] `bootstrap().catch(() => process.exit(1))`
- [x] `helmet()`, CORS محدود، `trust proxy`, `ValidationPipe` سخت‌گیرانه
- [x] Soft delete برای آگهی‌ها (`ARCHIVED`) — بدون DELETE فیزیکی
- [x] پاسخ یکنواخت API (`TransformInterceptor` + `HttpExceptionFilter`)
- [x] صفحات `error.tsx`, `loading.tsx`, `not-found.tsx` در فرانت‌اند

## موارد باز (خارج از دامنه کد — نیازمند تصمیم/زیرساخت تیم)
- [ ] **Backup**: تعریف دقیق سیاست بکاپ‌گیری از PostgreSQL (schedule، retention، محل ذخیره‌سازی جدا از سرور اصلی) و تست بازیابی (restore drill).
- [ ] **Pen Test**: تست نفوذ توسط تیم/شخص ثالث مستقل پیش از رفتن به Production، به‌ویژه روی مسیرهای OTP، آپلود فایل و پنل ادمین.
- [ ] **بازبینی حقوقی**: بررسی متن قراردادها/رضایت‌نامه‌ها برای پردازش اطلاعات تماس مشتریان (شماره موبایل، مدارک آپلودی) مطابق با الزامات داخلی.
- [ ] **مدیریت رازها (Secrets)**: انتقال `JWT_SECRET`, `STORAGE_SECRET_ACCESS_KEY`, `SENTRY_DSN` و غیره به یک secret manager به‌جای فایل `.env` در سرور Production.
- [ ] **مانیتورینگ زیرساخت**: تنظیم آلارم برای اشباع صف BullMQ، افزایش نرخ خطای `MessageLog.FAILED`، و در دسترس نبودن Redis/PostgreSQL.
- [ ] **محدودیت واقعی Object Storage**: تعیین سیاست پاک‌سازی فایل‌های یتیم (orphaned uploads) در Storage پس از حذف رکورد مرتبط.

## نحوه اجرای تست‌ها
```bash
cd backend
docker compose up -d
npm install
npx prisma migrate deploy
npm run test        # تست‌های واحد
npm run test:e2e     # تست E2E (به postgres + redis در حال اجرا نیاز دارد)
npm run build
```

> **یادداشت محیط توسعه فعلی**: در محیطی که این کد نوشته شد دسترسی شبکه به `registry.npmjs.org` مسدود بود،
> بنابراین `npm install` و در نتیجه build/test واقعی اجرا نشدند. کد به‌صورت کامل و بر اساس قرارداد‌های
> پروژه (بخش ۳ پرامپت) نوشته شده، اما باید در محیطی با دسترسی اینترنت یک‌بار `npm install`, `npm run build`,
> `npm run test`, `npm run test:e2e` اجرا و نتیجه بررسی شود.
