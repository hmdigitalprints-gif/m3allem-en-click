import fs from 'fs';
import path from 'path';

const file = fs.readFileSync(path.join(process.cwd(), 'public/locales/ar.json'), 'utf-8');
const ar = JSON.parse(file);

const translations = {
  "admin_active_users": "المستخدمين النشطين",
  "admin_add_cat": "إضافة فئة",
  "admin_add_category": "إضافة فئة",
  "admin_artisan_services": "خدمات الحرفيين",
  "admin_btn_cancel": "إلغاء",
  "admin_btn_delete": "حذف",
  "admin_btn_edit": "تعديل",
  "admin_btn_hide": "إخفاء",
  "admin_btn_restore": "استعادة",
  "admin_btn_save_cat": "حفظ الفئة",
  "admin_btn_save_changes": "حفظ التغييرات",
  "admin_btn_saving": "جاري الحفظ...",
  "admin_cat_actions": "الإجراءات",
  "admin_cat_active": "نشط",
  "admin_cat_comm": "نسبة العمولة",
  "admin_cat_hidden": "مخفي",
  "admin_cat_name": "اسم الفئة",
  "admin_cat_status": "الحالة",
  "admin_categories_desc": "إضافة وتعديل أو إخفاء فئات الخدمات والمنتجات.",
  "admin_categories_mgmt": "إدارة الفئات",
  "admin_commission_desc": "إدارة رسوم المنصة ونسب العمولة.",
  "admin_commission_rules": "قواعد العمولة",
  "admin_commission_rules_error": "فشل في تحديث قواعد العمولة.",
  "admin_commission_rules_success": "تم تحديث قواعد العمولة بنجاح!",
  "admin_control": "لوحة التحكم",
  "admin_conversion_rate": "معدل التحويل",
  "admin_edit_cat": "تعديل الفئة",
  "admin_featured_artisan_comm": "عمولة الحرفي المميز (%)",
  "admin_global_material_comm": "عمولة المواد العامة (%)",
  "admin_global_service_comm": "عمولة الخدمات العامة (%)",
  "admin_lbl_cat_name": "اسم الفئة",
  "admin_lbl_comm_rate": "معدل العمولة (0.0 - 1.0)",
  "admin_lbl_comm_rate_desc": "0.10 تعني 10٪ عمولة على كل طلب.",
  "admin_loading_cats": "جاري تحميل الفئات...",
  "admin_material_sales": "مبيعات المواد",
  "admin_panel": "لوحة الإدارة",
  "admin_premium_seller_comm": "عمولة البائع المميز (%)",
  "admin_recent_activity": "أحدث النشاطات",
  "admin_reports": "التقارير",
  "admin_revenue_overview": "نظرة عامة على الإيرادات",
  "admin_search": "بحث...",
  "admin_total_bookings": "إجمالي الحجوزات",
  "admin_total_revenue": "إجمالي الإيرادات",
  "admin_wed": "الأربعاء",
  "ai_studio_studio": "الاستوديو",
  "auth_success": "نجاح!",
  "auth_success_desc": "تم التحقق من رقمك.",
  "cat_carpentry": "نجارة",
  "cat_electricity": "كهرباء",
  "cookie_sec1_desc": "ملفات تعريف الارتباط هي ملفات نصية صغيرة",
  "cookie_sec2_desc": "نحن نستخدم ملفات تعريف الارتباط لعدة أسباب",
  "cookie_sec3_desc1": "هذه الملفات ضرورية للغاية",
  "cookie_sec3_desc2": "تستخدم هذه الملفات لتحسين الأداء",
  "cookie_sec3_desc3": "تجمع هذه الملفات معلومات تستخدم إما",
  "cookie_sec3_type1": "ملفات التتبع الأساسية:",
  "cookie_sec3_type2": "ملفات الأداء والوظائف:",
  "cookie_sec3_type3": "ملفات التحليل والتخصيص:",
  "cookie_sec4_desc": "لديك الحق في تحديد قبول أو رفض ملفات تعريف الارتباط.",
  "crafting_excellence": "نصنع الامتياز",
  "currency_mad": "درهم",
  "dashboard_authorized": "مُصادق",
  "dashboard_avg_rating": "متوسط التقييم",
  "dashboard_btn_continue": "متابعة",
  "dashboard_just_now": "الآن",
  "dashboard_lbl_active": "السجلات النشطة",
  "dashboard_local_auth": "مُصادقة محلية",
  "dashboard_log_session": "جلسة تسجيل دخول جديدة",
  "dashboard_log_success": "تم التحقق بنجاح",
  "dashboard_mins_ago": "قبل دقيقتين",
  "dashboard_provider": "المزود",
  "dashboard_role": "الصلاحية",
  "dashboard_security_log": "سجلات الأمان",
  "dashboard_unverified": "حساب غير موثق",
  "dashboard_verified": "حساب موثق",
  "find_ar_all": "الكل",
  "invalid_otp": "رمز غير صالح",
  "invalid_phone": "رقم هاتف غير صالح",
  "login": "دخول",
  "otp_fallback_msg": "إذا استغرقت الرسالة القصيرة وقتًا طويلاً، سنرسل بديلاً.",
  "otp_sent_to": "تم إرسال الرمز إلى",
  "phone_auth_send_code": "إرسال الرمز",
  "phone_auth_title": "المصادقة عبر الهاتف",
  "phone_auth_verify": "تحقق",
  "resend_in": "إعادة الإرسال خلال",
  "resend_now": "إعادة إرسال الرمز",
  "terms_sec1_desc": "من خلال الوصول أو استخدام ",
  "terms_sec2_desc": "توفر المنصة سوقًا",
  "terms_sec3_desc": "المستخدمون مسؤولون عن الحفاظ",
  "terms_sec4_desc": "تتم معالجة المدفوعات من خلالระบบ أماننا",
  "terms_sec5_desc": "لن تتحمل المنصة المسؤلية"
};

for (const key in translations) {
  if (ar[key]) {
    ar[key] = translations[key];
  }
}

// Convert "system" texts to arabic if found
if (ar['link'] === 'link') ar['link'] = 'رابط';

function sortObject(obj) {
  return Object.keys(obj).sort().reduce((result, key) => {
    result[key] = obj[key];
    return result;
  }, {});
}

fs.writeFileSync(path.join(process.cwd(), 'public/locales/ar.json'), JSON.stringify(sortObject(ar), null, 2));
console.log('Fixed English strings in ar.json');
