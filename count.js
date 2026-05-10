import fs from 'fs';
import path from 'path';

const file = fs.readFileSync(path.join(process.cwd(), 'public/locales/ar.json'), 'utf-8');
const ar = JSON.parse(file);
let enStrings = {};
for(const key in ar) {
    if (/[a-zA-Z]/.test(ar[key])) {
        enStrings[key] = ar[key];
    }
}
console.log(JSON.stringify(enStrings, null, 2));
