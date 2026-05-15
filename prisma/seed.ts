import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const CATEGORIES = [
  { name: "Plumbing", icon: "wrench", image: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7" },
  { name: "Electrical", icon: "zap", image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4" },
  { name: "Cleaning", icon: "sparkles", image: "https://images.unsplash.com/photo-1581578731548-c64695cc6954" },
];

const CITIES = ["Casablanca", "Rabat", "Marrakech"];
const REAL_NAMES = ["Mohammed El Amrani", "Yassine Benjelloun", "Amine Tazi", "Omar Mansouri"];

async function main() {
  console.log("Seeding database via prisma/seed.ts...");
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

  // Categories
  for (const cat of CATEGORIES) {
    const category = await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: { name: cat.name, icon: cat.icon, isActive: true },
    });

    // Seed translations for these categories
    const translations = [
      { key: `cat_${category.id}`, lang: 'en', val: cat.name },
      { key: `cat_${category.id}`, lang: 'fr', val: cat.name === 'Plumbing' ? 'Plomberie' : cat.name === 'Electrical' ? 'Électricité' : 'Nettoyage' },
      { key: `cat_${category.id}`, lang: 'ar', val: cat.name === 'Plumbing' ? 'سباكة' : cat.name === 'Electrical' ? 'كهرباء' : 'تنظيف' }
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
