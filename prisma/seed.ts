import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const CATEGORIES = [
  { name: "Home & Construction", icon: "hammer", image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd", translations: { fr: "Maison & Bâtiment", en: "Home & Construction", ar: "البيت والبناء" } },
  { name: "Repair & Maintenance", icon: "wrench", image: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7", translations: { fr: "Réparation & Maintenance", en: "Repair & Maintenance", ar: "الإصلاح والصيانة" } },
  { name: "Automotive", icon: "car", image: "https://images.unsplash.com/photo-1486006920555-c77dce18193b", translations: { fr: "Automobile", en: "Automotive", ar: "السيارات" } },
  { name: "IT & Technology", icon: "monitor", image: "https://images.unsplash.com/photo-1547082299-de196ea013d6", translations: { fr: "Informatique & Technologie", en: "IT & Technology", ar: "تكنولوجيا المعلومات" } },
  { name: "Web & Mobile Development", icon: "code", image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c", translations: { fr: "Développement Web & Mobile", en: "Web & Mobile Development", ar: "تطوير الويب والهاتف" } },
  { name: "Design & Creative", icon: "palette", image: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634", translations: { fr: "Design & Création", en: "Design & Creative", ar: "التصميم والإبداع" } },
  { name: "Digital Marketing", icon: "trending-up", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f", translations: { fr: "Marketing Digital", en: "Digital Marketing", ar: "التسويق الرقمي" } },
  { name: "Training & Coaching", icon: "graduation-cap", image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655", translations: { fr: "Formation & Coaching", en: "Training & Coaching", ar: "التعليم والتدريب" } },
  { name: "Health & Wellness", icon: "heart", image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b", translations: { fr: "Santé & Bien-être", en: "Health & Wellness", ar: "الصحة والرفاهية" } },
  { name: "Professional Services", icon: "briefcase", image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40", translations: { fr: "Services Professionnels", en: "Professional Services", ar: "الخدمات المهنية" } },
  { name: "Transport & Logistics", icon: "truck", image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d", translations: { fr: "Transport & Logistique", en: "Transport & Logistics", ar: "النقل واللوجستيات" } },
  { name: "Home Services", icon: "home", image: "https://images.unsplash.com/photo-1581578731548-c64695cc6954", translations: { fr: "Services à domicile", en: "Home Services", ar: "الخدمات المنزلية" } },
  { name: "Events", icon: "calendar", image: "https://images.unsplash.com/photo-1511578314322-379afb476865", translations: { fr: "Événements", en: "Events", ar: "المناسبات والفعاليات" } },
  { name: "Photography & Video", icon: "camera", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32", translations: { fr: "Photographie & Vidéo", en: "Photography & Video", ar: "التصوير والفيديو" } },
  { name: "Beauty", icon: "sparkles", image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f", translations: { fr: "Beauté", en: "Beauty", ar: "التجميل والجمال" } },
  { name: "Pets", icon: "dog", image: "https://images.unsplash.com/photo-1477884213360-7e9d7dcc1e48", translations: { fr: "Animaux", en: "Pets", ar: "الحيوانات الأليفة" } },
  { name: "Crafts", icon: "scissors", image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38", translations: { fr: "Artisanat", en: "Crafts", ar: "الحrf و الصناعة" } },
  { name: "Finance & Accounting", icon: "dollar-sign", image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c", translations: { fr: "Finance & Comptabilité", en: "Finance & Accounting", ar: "المالية والمحاسبة" } },
  { name: "Legal", icon: "scale", image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f", translations: { fr: "Juridique", en: "Legal", ar: "الخدمات القانونية" } },
  { name: "Translation & Writing", icon: "book-open", image: "https://images.unsplash.com/photo-1455390582262-044cdead277a", translations: { fr: "Traduction & Rédaction", en: "Translation & Writing", ar: "الترجمة والكتابة" } }
];

const CITIES = ["Casablanca", "Rabat", "Marrakech"];

async function main() {
  console.log("Seeding database via prisma/seed.ts with 20 categories...");
  const passwordHash = await bcrypt.hash("password123", 10);

  // Languages
  const languages = [
    { code: 'en', name: 'English', native_name: 'English' },
    { code: 'fr', name: 'French', native_name: 'Français' },
    { code: 'ar', name: 'Arabic', native_name: 'العربية', is_rtl: true }
  ];

  for (const lang of languages) {
    await prisma.language.upsert({
      where: { code: lang.code },
      update: {},
      create: {
        code: lang.code,
        name: lang.name,
        nativeName: lang.native_name,
        isRtl: lang.is_rtl || false,
        isActive: true
      }
    });
  }

  // Categories & Subcategory structures stored inside Category translations and Translation tables
  for (const cat of CATEGORIES) {
    const category = await prisma.category.upsert({
      where: { name: cat.name },
      update: {
        icon: cat.icon,
        isActive: true,
        translations: cat.translations
      },
      create: { 
        name: cat.name, 
        icon: cat.icon, 
        isActive: true,
        translations: cat.translations
      },
    });

    // Seed translations for these categories
    const translations = [
      { key: `cat_${category.id}`, lang: 'en', val: cat.translations.en },
      { key: `cat_${category.id}`, lang: 'fr', val: cat.translations.fr },
      { key: `cat_${category.id}`, lang: 'ar', val: cat.translations.ar }
    ];

    for (const t of translations) {
      await prisma.translation.upsert({
        where: { key_languageCode: { key: t.key, languageCode: t.lang } },
        update: { value: t.val },
        create: { key: t.key, languageCode: t.lang, value: t.val }
      });
    }
  }

  // Admin
  await prisma.user.upsert({
    where: { email: "admin@test.com" },
    update: {},
    create: {
      email: "admin@test.com",
      name: "Platform Admin",
      role: "admin",
      passwordHash,
      verified: true
    },
  });

  // Client
  await prisma.user.upsert({
    where: { email: "client0@test.com" },
    update: {},
    create: {
      email: "client0@test.com",
      name: "Demo Client",
      role: "client",
      passwordHash,
      verified: true
    },
  });

  // Artisan
  const artisanUser = await prisma.user.upsert({
    where: { email: "artisan0@test.com" },
    update: {},
    create: {
      email: "artisan0@test.com",
      name: "Demo Artisan",
      role: "artisan",
      passwordHash,
      verified: true
    },
  });
  
  const category = await prisma.category.findFirst();
  if (category) {
    await prisma.artisan.upsert({
      where: { userId: artisanUser.id },
      update: {},
      create: {
        userId: artisanUser.id,
        categoryId: category.id,
        bio: "Demo Artisan profile",
        isVerified: true
      }
    });
  }

  // Seller
  await prisma.user.upsert({
    where: { email: "seller0@test.com" },
    update: {},
    create: {
      email: "seller0@test.com",
      name: "Demo Seller",
      role: "seller",
      passwordHash,
      verified: true
    },
  });

  // Company
  await prisma.user.upsert({
    where: { email: "company0@test.com" },
    update: {},
    create: {
      email: "company0@test.com",
      name: "Demo Company",
      role: "company",
      passwordHash,
      verified: true
    },
  });

  console.log("Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
