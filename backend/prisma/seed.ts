import { DealType, PrismaClient, PropertyType, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

const properties = [
  {
    title: 'ویلای مدرن دوبلکس',
    description:
      'ویلای دوبلکس نوساز با نمای مدرن، حیاط اختصاصی و دسترسی آسان به مرکز شهر نوشهر. سند تک‌برگ و آماده انتقال.',
    province: 'مازندران',
    city: 'نوشهر',
    region: 'خیابان دریا',
    type: PropertyType.VILLA,
    dealType: DealType.SALE,
    price: 8_500_000_000,
    areaSqm: 320,
    hasSingleDeed: true,
  },
  {
    title: 'زمین مسکونی محصور',
    description: 'زمین مسکونی با موقعیت عالی جهت ساخت ویلا، محصور و تسطیح‌شده در نزدیکی جاده چالوس.',
    province: 'گیلان',
    city: 'لاهیجان',
    region: 'جاده چاف',
    type: PropertyType.LAND,
    dealType: DealType.SALE,
    price: 2_900_000_000,
    areaSqm: 450,
    hasSingleDeed: false,
  },
  {
    title: 'مغازه تجاری نبش',
    description: 'مغازه تجاری واقع در نبش خیابان اصلی گلسار با موقعیت مکانی عالی برای هر نوع کسب‌وکار.',
    province: 'گیلان',
    city: 'رشت',
    region: 'گلسار',
    type: PropertyType.SHOP,
    dealType: DealType.SALE,
    price: 6_200_000_000,
    areaSqm: 48,
    hasSingleDeed: true,
  },
  {
    title: 'آپارتمان نوساز',
    description: 'آپارتمان نوساز با متریال درجه یک، پارکینگ و انباری اختصاصی در بهترین منطقه ساری.',
    province: 'مازندران',
    city: 'ساری',
    region: 'خیابان مدرس',
    type: PropertyType.APARTMENT,
    dealType: DealType.SALE,
    price: 4_100_000_000,
    areaSqm: 145,
    hasSingleDeed: true,
  },
  {
    title: 'باغ‌ویلای محصور',
    description: 'باغ‌ویلای وسیع و محصور با درختان مثمر، مناسب سکونت دائم یا ییلاقی در نزدیکی جاده کرج.',
    province: 'مازندران',
    city: 'چالوس',
    region: 'جاده کرج',
    type: PropertyType.VILLA,
    dealType: DealType.SALE,
    price: 5_500_000_000,
    areaSqm: 800,
    hasSingleDeed: false,
  },
  {
    title: 'آپارتمان ساحلی',
    description: 'آپارتمان اجاره‌ای با چشم‌انداز دریا، کنار ساحل و نزدیک به امکانات رفاهی بابلسر.',
    province: 'مازندران',
    city: 'بابلسر',
    region: 'کنار دریا',
    type: PropertyType.APARTMENT,
    dealType: DealType.RENT,
    price: 400_000_000,
    areaSqm: 95,
    hasSingleDeed: true,
  },
  {
    title: 'بیجار مرغوب شالیزاری',
    description:
      'زمین بیجار (شالیزار) با خاک مرغوب و دسترسی به آب کشاورزی، مناسب برنج‌کاری. در حال تبدیل سند نسقی به تک‌برگ.',
    province: 'مازندران',
    city: 'نوشهر',
    region: 'روستای کمربندی',
    type: PropertyType.PADDY_FIELD,
    dealType: DealType.SALE,
    price: 1_800_000_000,
    areaSqm: 2200,
    hasSingleDeed: false,
  },
];

async function seedAdmin(): Promise<void> {
  const adminMobile = process.env.ADMIN_MOBILE;
  if (!adminMobile) {
    console.log('ADMIN_MOBILE not set — skipping admin bootstrap. Set it in .env to create an initial ADMIN user.');
    return;
  }
  if (!/^09\d{9}$/.test(adminMobile)) {
    console.warn(`ADMIN_MOBILE "${adminMobile}" does not look like a valid mobile number — skipping.`);
    return;
  }

  await prisma.user.upsert({
    where: { mobile: adminMobile },
    update: { role: UserRole.ADMIN },
    create: { mobile: adminMobile, role: UserRole.ADMIN },
  });
  console.log(`Admin bootstrap: ${adminMobile} ensured with role ADMIN.`);
}

async function seedConstructionRequest(): Promise<void> {
  const trackingCode = 'ES-BUILD-001';
  const existing = await prisma.adminServiceRequest.findUnique({ where: { trackingCode } });
  if (existing) return;

  await prisma.adminServiceRequest.create({
    data: {
      trackingCode,
      contactMobile: '09120000001',
      serviceType: 'CONSTRUCTION_PARTNERSHIP',
      notes: 'زمین ۵۰۰ متری در نوشهر — مشارکت در ساخت ویلا',
      statusHistory: {
        create: {
          newStatus: 'SUBMITTED',
          note: 'درخواست نمونه ساخت و پیمانکاری',
        },
      },
    },
  });
  console.log('Seed complete: 1 construction service request ensured.');
}

async function main(): Promise<void> {
  for (const property of properties) {
    const existing = await prisma.property.findFirst({ where: { title: property.title, city: property.city } });
    if (existing) {
      await prisma.property.update({ where: { id: existing.id }, data: property });
      continue;
    }
    await prisma.property.create({ data: property });
  }
  console.log(`Seed complete: ${properties.length} properties ensured.`);

  await seedConstructionRequest();
  await seedAdmin();
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
