const fs = require('fs');
const path = require('path');
function getSizes(dir) {
  let filesToSizes = [];
  try {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      if (['node_modules', '.git'].includes(file)) continue;
      const tPath = path.join(dir, file);
      const stat = fs.statSync(tPath);
      if (stat.isDirectory()) {
         filesToSizes = filesToSizes.concat(getSizes(tPath));
      } else {
         filesToSizes.push({p: tPath, s: stat.size});
      }
    }
  } catch (e) {}
  return filesToSizes;
}
const all = getSizes('.');
all.sort((a,b) => b.s - a.s);
console.log(all.slice(0, 50).map(x => (x.s / 1024).toFixed(2) + 'KB ' + x.p).join('\n'));
