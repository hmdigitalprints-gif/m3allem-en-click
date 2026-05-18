const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./src/components/layout');
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/bg-\[#0F1117\]/g, 'bg-[var(--card-bg)]');
  content = content.replace(/bg-\[#161922\]/g, 'bg-[var(--card-surface)]');
  content = content.replace(/bg-\[#0A0C10\]/g, 'bg-[var(--bg)]');
  content = content.replace(/border-white\/5/g, 'border-[var(--border)]');
  fs.writeFileSync(file, content);
}
console.log('Patch complete.');
