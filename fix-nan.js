const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      let changed = false;
      content = content.replace(/Number\(([^)]+)\)\.toFixed\((2|0)\)/g, (match, p1, p2) => {
        if (p1.includes('||')) return match;
        changed = true;
        return `(Number(${p1}) || 0).toFixed(${p2})`;
      });

      content = content.replace(/([a-zA-Z0-9_?.]+)\.toFixed\((2|0)\)/g, (match, p1, p2) => {
        if (p1 === 'Number' || p1.startsWith('Number(') || p1.startsWith('(Number')) return match;
        if (p1.includes('Math.min')) return match;
        changed = true;
        return `(Number(${p1}) || 0).toFixed(${p2})`;
      });

      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

console.log('Running fixing script from: ' + __dirname);
processDir(path.join(process.cwd(), 'src/components'));
processDir(path.join(process.cwd(), 'src/pages'));
processDir(path.join(process.cwd(), 'src/services'));
