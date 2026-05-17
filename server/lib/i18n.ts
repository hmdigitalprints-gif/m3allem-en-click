import prisma from './prisma.ts';
import NodeCache from 'node-cache';

// Cache for translations and settings (1 hour)
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

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
  
  const cacheKey = `trans_${key}_${lang}`;
  const cached = cache.get<string>(cacheKey);
  if (cached !== undefined) return cached;
  
  try {
    const translation = await prisma.translation.findUnique({
      where: {
        key_languageCode: {
          key,
          languageCode: lang
        }
      }
    });
    
    let result = key;
    if (translation) {
      result = translation.value || key;
    } else {
      // Fallback to default language if translation not found
      const defaultLang = await getDefaultLanguage();
      
      if (defaultLang && defaultLang !== lang) {
        const fallback = await prisma.translation.findUnique({
          where: {
            key_languageCode: {
              key,
              languageCode: defaultLang
            }
          }
        });
        if (fallback) result = fallback.value || key;
      }
    }
    
    cache.set(cacheKey, result);
    return result;
  } catch (error: any) {
    if (!error?.message?.includes('PrismaClientInitializationError') && !String(error).includes('PrismaClientInitializationError')) {
      console.error(`Translation error for key ${key} in ${lang}:`, error);
    }
    return key;
  }
}

/**
 * Translates multiple keys into the specified language in a single query.
 */
export async function getTranslations(keys: string[], lang: string = 'en'): Promise<Record<string, string>> {
  if (!isDbReady() || keys.length === 0) {
    return keys.reduce((acc, key) => { acc[key] = key; return acc; }, {} as Record<string, string>);
  }

  const results: Record<string, string> = {};
  const missingKeys: string[] = [];

  keys.forEach(key => {
    const cacheKey = `trans_${key}_${lang}`;
    const cached = cache.get<string>(cacheKey);
    if (cached !== undefined) {
      results[key] = cached;
    } else {
      missingKeys.push(key);
    }
  });

  if (missingKeys.length === 0) return results;

  try {
    const uniqueMissingKeys = Array.from(new Set(missingKeys));
    const translations = await prisma.translation.findMany({
      where: {
        languageCode: lang,
        key: { in: uniqueMissingKeys }
      }
    });

    const resultMap = new Map(translations.map(t => [t.key, t.value]));
    
    // Handle fallbacks for missing translations
    const stillMissing = uniqueMissingKeys.filter(key => !resultMap.has(key));
    
    if (stillMissing.length > 0) {
      const defaultLang = await getDefaultLanguage();
      if (defaultLang && defaultLang !== lang) {
        const fallbacks = await prisma.translation.findMany({
          where: {
            languageCode: defaultLang,
            key: { in: stillMissing }
          }
        });
        fallbacks.forEach(f => resultMap.set(f.key, f.value));
      }
    }

    // Populate results and cache
    uniqueMissingKeys.forEach(key => {
      const value = resultMap.get(key) || key;
      results[key] = value;
      cache.set(`trans_${key}_${lang}`, value);
    });

    return results;
  } catch (error) {
    console.error("Batch translation error:", error);
    return keys.reduce((acc, key) => { acc[key] = results[key] || key; return acc; }, {} as Record<string, string>);
  }
}

async function getDefaultLanguage(): Promise<string> {
  const cacheKey = 'default_lang';
  const cached = cache.get<string>(cacheKey);
  if (cached) return cached;

  const defaultLangSetting = await prisma.setting.findUnique({
    where: { key: 'default_language' }
  });
  const val = defaultLangSetting?.value || 'en';
  cache.set(cacheKey, val);
  return val;
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
      if (['en', 'fr', 'ar'].includes(lang)) return lang;
    }
    
    // 2. Check cookies (m3allem_lang)
    const cookieLang = req.cookies?.m3allem_lang;
    if (cookieLang && ['en', 'fr', 'ar'].includes(cookieLang)) return cookieLang;
    
    // 3. Check user preference if authenticated
    if (req.user && (req.user.preferredLanguage || req.user.preferred_language)) {
      const userLang = req.user.preferredLanguage || req.user.preferred_language;
      if (['en', 'fr', 'ar'].includes(userLang)) return userLang;
    }
    
    // 4. Check Accept-Language header
    const acceptLang = req.headers['accept-language'];
    if (acceptLang && typeof acceptLang === 'string') {
      const lang = acceptLang.split(',')[0].split('-')[0].toLowerCase();
      if (['en', 'fr', 'ar'].includes(lang)) return lang;
    }
    
    // 5. Fallback to default setting
    return await getDefaultLanguage();
  } catch (error: any) {
    if (!error?.message?.includes('PrismaClientInitializationError') && !String(error).includes('PrismaClientInitializationError')) {
      console.error("Language detection error:", error);
    }
    return 'en';
  }
}
