import fs from 'fs';
import path from 'path';

const file = fs.readFileSync(path.join(process.cwd(), 'public/locales/fr.json'), 'utf-8');
const fr = JSON.parse(file);

const keys = Object.keys(fr);
console.log(`Total keys in fr.json: ${keys.length}`);

// Let's see some keys that start with "faq"
for (let k of keys) {
  if (k.startsWith('faq_')) {
    console.log(k, fr[k]);
  }
}
