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
      
      // Fix instances of Number(...).toFixed(2) + " MAD" producing NaN
      // Since it's hard to catch all variants perfectly, we can replace:
      // Number(xxx).toFixed(2) -> (Number(xxx) || 0).toFixed(2)
      
      let changed = false;
      content = content.replace(/Number\(([^)]+)\)\.toFixed\((2)\)/g, (match, p1) => {
        // If p1 already has an `|| 0`, skip
        if (p1.includes('|| 0') || p1.includes('||0')) return match;
        changed = true;
        return `(Number(${p1}) || 0).toFixed(2)`;
      });

      // Also handle plain variable.toFixed(2) MAD like booking.price.toFixed(2) -> (Number(booking.price) || 0).toFixed(2)
      content = content.replace(/([a-zA-Z0-9_?.]+)\.toFixed\((2)\)/g, (match, p1) => {
        if (p1 === 'Number' || p1.startsWith('Number(') || p1.startsWith('(Number')) return match;
        changed = true;
        return `(Number(${p1}) || 0).toFixed(2)`;
      });

      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDir(path.join(__dirname, 'src/components'));
processDir(path.join(__dirname, 'src/pages'));
processDir(path.join(__dirname, 'src/services'));
