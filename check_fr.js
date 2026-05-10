import fs from 'fs';
import path from 'path';

const file = fs.readFileSync(path.join(process.cwd(), 'public/locales/fr.json'), 'utf-8');
const fr = JSON.parse(file);

const keys = Object.keys(fr);
let engLikeCount = 0;
for (const key of keys) {
  // Simple heuristic: if value has english words like "the", "and", "is", "a", "of"
  if (/\b(the|and|is|a|of)\b/i.test(fr[key])) {    
    if (fr[key] !== 'a') {
      console.log(key, fr[key]);
      engLikeCount++;
    }
  }
}
console.log(`Found ${engLikeCount} potentially untranslated strings in fr.json`);
