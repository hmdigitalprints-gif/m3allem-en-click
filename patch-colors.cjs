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

const files = walk('./src/components/admin');
// Layouts
files.push(...walk('./src/components/layout'));

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  // Replace manual text-colors 
  // We want to avoid replacing inside gradients or contexts where it shouldn't be touched.
  // Generally, text-white should become text-[var(--text)]
  content = content.replace(/(?<!-)text-white/g, 'text-[var(--text)]');
  
  // text-gray-200 -> text-[var(--text)] 
  content = content.replace(/text-gray-200/g, 'text-[var(--text)]');

  // text-gray-300, 400, 500, 600 -> text-[var(--text-muted)]
  content = content.replace(/text-gray-[3456]00/g, 'text-[var(--text-muted)]');
  
  // hover:text-white -> hover:text-[var(--text)]
  content = content.replace(/hover:text-white/g, 'hover:text-[var(--text)]');
  
  // bg-white/5, bg-white/10 -> hover:bg-[var(--card-surface)]
  // We'll replace bg-white/5 with bg-[var(--border)] or similar, wait.
  // Actually, wait, let's keep it simple: 
  // text-black inside a yellow button -> text-[#000] is safer if we just leave text-black.

  // The placeholder:text-gray-600 -> placeholder:text-[var(--text-muted)]
  content = content.replace(/placeholder:text-gray-600/g, 'placeholder:text-[var(--text-muted)]');

  // border-white/5 or border-white/10
  content = content.replace(/border-white\/[0-9]+/g, 'border-[var(--border)]');

  // bg-white/5 -> bg-[var(--glass-bg)] or similar
  content = content.replace(/bg-white\/5/g, 'bg-[var(--border)]');
  content = content.replace(/bg-white\/10/g, 'bg-[var(--border)]');

  fs.writeFileSync(file, content);
}
console.log('Patch complete.');
