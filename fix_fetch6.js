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
    
    // Fix fetch('...', { credentials: 'include'},
    // and fetch('...', { credentials: 'include'}
    content = content.replace(/fetch\(([^,]+),\s*\{\s*credentials:\s*'include'\s*\}\s*,/g, "fetch($1, { credentials: 'include'}),");
    content = content.replace(/fetch\(([^,]+),\s*\{\s*credentials:\s*'include'\s*\}\s*\n/g, "fetch($1, { credentials: 'include'})\n");
    // Also matching arrays like 
    // fetch('...', { credentials: 'include' }
    // ]);
    content = content.replace(/fetch\(([^,]+),\s*\{\s*credentials:\s*'include'\s*\}\s*\]/g, "fetch($1, { credentials: 'include'})\n]");

    fs.writeFileSync(filePath, content);
  }
});
