import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function seed() {
  const languages = [
    { code: 'en', name: 'English', nativeName: 'English', isRtl: false, isActive: true },
    { code: 'fr', name: 'French', nativeName: 'Français', isRtl: false, isActive: true },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', isRtl: true, isActive: true }
  ];

  for (const lang of languages) {
    await prisma.language.upsert({
      where: { code: lang.code },
      update: lang,
      create: lang,
    });
  }
  
  // Basic translations just to have some text
  const translations = [
    { key: 'lang_switcher', en: 'English', fr: 'Français', ar: 'العربية' },
    { key: 'nav_home', en: 'Home', fr: 'Accueil', ar: 'الرئيسية' },
    { key: 'nav_categories', en: 'Categories', fr: 'Catégories', ar: 'التصنيفات' },
    { key: 'nav_how_it_works', en: 'How it works', fr: 'Comment ça marche', ar: 'كيف نعمل' },
    { key: 'nav_login', en: 'Login', fr: 'Connexion', ar: 'دخول' },
    { key: 'nav_register', en: 'Register', fr: "S'inscrire", ar: 'تسجيل' }
  ];

  for (const t of translations) {
    for (const code of ['en', 'fr', 'ar']) {
      await prisma.translation.upsert({
        where: { key_languageCode: { key: t.key, languageCode: code } },
        update: { value: (t as any)[code] },
        create: { key: t.key, languageCode: code, value: (t as any)[code] },
      });
    }
  }

  console.log("Languages and basic translations seeded.");
}

seed()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
