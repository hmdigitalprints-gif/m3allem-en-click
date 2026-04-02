import db from '../db.ts';

/**
 * Translates a key into the specified language.
 * Falls back to the key itself if no translation is found.
 */
export function t(key: string, lang: string = 'en'): string {
  try {
    const translation = db.prepare('SELECT value FROM translations WHERE key = ? AND language_code = ?').get(key, lang) as { value: string };
    if (translation) return translation.value;
    
    // Fallback to default language if translation not found
    const defaultLang = db.prepare('SELECT value FROM settings WHERE key = ?').get('default_language') as { value: string };
    if (defaultLang && defaultLang.value !== lang) {
      const fallback = db.prepare('SELECT value FROM translations WHERE key = ? AND language_code = ?').get(key, defaultLang.value) as { value: string };
      if (fallback) return fallback.value;
    }
    
    return key;
  } catch (error) {
    console.error(`Translation error for key ${key} in ${lang}:`, error);
    return key;
  }
}

/**
 * Detects the preferred language from the request.
 * Priority: Query Param > User Preference (if auth) > Accept-Language Header > Default (en)
 */
export function getPreferredLanguage(req: any): string {
  const dbInstance = (req.app as any).get('db') || db;
  
  // 1. Check query parameter
  if (req.query.lang && typeof req.query.lang === 'string') {
    const lang = req.query.lang.toLowerCase();
    const exists = dbInstance.prepare('SELECT code FROM languages WHERE code = ? AND is_active = 1').get(lang);
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
    const exists = dbInstance.prepare('SELECT code FROM languages WHERE code = ? AND is_active = 1').get(lang);
    if (exists) return lang;
  }
  
  // 4. Fallback to default setting
  const defaultLang = dbInstance.prepare('SELECT value FROM settings WHERE key = ?').get('default_language') as { value: string };
  return defaultLang?.value || 'en';
}
