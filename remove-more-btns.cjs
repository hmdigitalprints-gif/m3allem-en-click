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

const files = walk('./src/components/admin/views');

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  // Remove empty MoreVertical/MoreHorizontal buttons
  content = content.replace(/<button[^>]*>\s*<MoreVertical[^>]*>\s*<\/button>/g, '');
  content = content.replace(/<button[^>]*>\s*<MoreHorizontal[^>]*>\s*<\/button>/g, '');

  fs.writeFileSync(file, content);
}
console.log('Removed empty More buttons.');
