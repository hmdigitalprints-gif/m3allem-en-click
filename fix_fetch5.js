import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('./src', (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix `headers: })`
    content = content.replace(/,\s*headers:\s*\}\)/g, '}');
    content = content.replace(/headers:\s*\}\)\./g, '}).');
    // For specific error above
    content = content.replace(/\{\s*credentials:\s*'include',\s*headers:\s*\}\)/g, "{ credentials: 'include' })");
    
    fs.writeFileSync(filePath, content);
  }
});
