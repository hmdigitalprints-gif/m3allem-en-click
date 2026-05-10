import fs from 'fs';
import path from 'path';

function findFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      findFiles(filePath, fileList);
    } else if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const extractRegex = /t\(\s*['"`]([a-zA-Z0-9_\-]+)['"`]\s*(?:,\s*['"`](.*?)['"`])?\s*\)/g;

const localesDir = path.join(process.cwd(), 'public', 'locales');
const arPath = path.join(localesDir, 'ar.json');
const enPath = path.join(localesDir, 'en.json');
const frPath = path.join(localesDir, 'fr.json');

const ar = JSON.parse(fs.readFileSync(arPath, 'utf-8'));
const en = JSON.parse(fs.readFileSync(enPath, 'utf-8'));
const fr = JSON.parse(fs.readFileSync(frPath, 'utf-8'));

const files = findFiles(path.join(process.cwd(), 'src'));
let count = 0;
for (const file of files) {
  const content = fs.readFileSync(file, 'utf-8');
  let match;
  while ((match = extractRegex.exec(content)) !== null) {
    const key = match[1];
    const defaultVal = match[2] || key; 

    if (en[key] === undefined || en[key] === "") en[key] = defaultVal;
    if (fr[key] === undefined || fr[key] === "") fr[key] = defaultVal;
    
    // For Arabic, maybe translate some obvious ones like FAQ?
    if (ar[key] === undefined || ar[key] === "") {
        if (key === 'faq_title') ar[key] = 'أسئلة مكررة';
        else if (key === 'faq_q1') ar[key] = 'كيف أحجز محترف؟';
        else if (key === 'faq_a1') ar[key] = 'ببساطة ابحث عن الخدمة التي تحتاجها، اختر محترف موثوق، وحدد موعداً من ملفه الشخصي مباشر.';
        else if (key === 'faq_q2') ar[key] = 'هل جميع الحرفيين معتمدين؟';
        else if (key === 'faq_a2') ar[key] = 'نعم. نقوم بإجراء فحوصات دقيقة للسوابق ونراجع أعمالهم السابقة لضمان حصولك على الأفضل.';
        else if (key === 'faq_q3') ar[key] = 'كيف يتم الدفع؟';
        else if (key === 'faq_a3') ar[key] = 'يتم الاحتفاظ بالمدفوعات بأمان ولا يتم تسليمها للحرفي إلا بعد تأكيدك لانتهاء العمل ورضاك التام.';
        else if (key === 'faq_q4') ar[key] = 'ماذا لو لم أكن راضياً؟';
        else if (key === 'faq_a4') ar[key] = 'فريق الدعم متاح 24/7 لحل أي خلافات وضمان حصولك على ما دفعت من أجله.';
        // fallback
        else ar[key] = defaultVal;
    }
    
    count++;
  }
}

// Write back sorted
function sortObject(obj) {
  return Object.keys(obj).sort().reduce((result, key) => {
    result[key] = obj[key];
    return result;
  }, {});
}

fs.writeFileSync(arPath, JSON.stringify(sortObject(ar), null, 2));
fs.writeFileSync(enPath, JSON.stringify(sortObject(en), null, 2));
fs.writeFileSync(frPath, JSON.stringify(sortObject(fr), null, 2));
console.log(`Extracted and processed ${count} keys.`);
