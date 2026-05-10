import prisma from './prisma.ts';

// Check if we have a valid database URL
const isDbReady = () => {
  const url = process.env.DATABASE_URL;
  return url && url !== 'postgresql://dummy:dummy@localhost:5432/dummy' && 
         (url.startsWith('postgresql://') || url.startsWith('postgres://'));
};

/**
 * Translates a key into the specified language.
 * Falls back to the key itself if no translation is found.
 */
export async function t(key: string, lang: string = 'en'): Promise<string> {
  if (!isDbReady()) return key;
  
  try {
    const translation = await prisma.translation.findUnique({
      where: {
        key_languageCode: {
          key,
          languageCode: lang
        }
      }
    });
    if (translation) return translation.value || key;
    
    // Fallback to default language if translation not found
    const defaultLangSetting = await prisma.setting.findUnique({
      where: { key: 'default_language' }
    });
    const defaultLang = defaultLangSetting?.value;
    
    if (defaultLang && defaultLang !== lang) {
      const fallback = await prisma.translation.findUnique({
        where: {
          key_languageCode: {
            key,
            languageCode: defaultLang
          }
        }
      });
      if (fallback) return fallback.value || key;
    }
    
    return key;
  } catch (error: any) {
    if (!error?.message?.includes('PrismaClientInitializationError') && !String(error).includes('PrismaClientInitializationError')) {
      console.error(`Translation error for key ${key} in ${lang}:`, error);
    }
    return key;
  }
}

/**
 * Detects the preferred language from the request.
 * Priority: Query Param > User Preference (if auth) > Accept-Language Header > Default (en)
 */
export async function getPreferredLanguage(req: any): Promise<string> {
  if (!isDbReady()) return 'en';
  
  try {
    // 1. Check query parameter
    if (req.query.lang && typeof req.query.lang === 'string') {
      const lang = req.query.lang.toLowerCase();
      const exists = await prisma.language.findUnique({
        where: { code: lang, isActive: true }
      });
      if (exists) return lang;
    }
    
    // 2. Check user preference if authenticated
    if (req.user && req.user.preferred_language) {
      return req.user.preferred_language;
    }
    
    // 3. Check Accept-Language header
    const acceptLang = req.headers['accept-language'];
    if (acceptLang && typeof acceptLang === 'string') {
      const lang = acceptLang.split(',')[0].split('-')[0].toLowerCase();
      const exists = await prisma.language.findUnique({
        where: { code: lang, isActive: true }
      });
      if (exists) return lang;
    }
    
    // 4. Fallback to default setting
    const defaultLangSetting = await prisma.setting.findUnique({
      where: { key: 'default_language' }
    });
    return defaultLangSetting?.value || 'en';
  } catch (error: any) {
    if (!error?.message?.includes('PrismaClientInitializationError') && !String(error).includes('PrismaClientInitializationError')) {
      console.error("Language detection error:", error);
    }
    return 'en';
  }
}
