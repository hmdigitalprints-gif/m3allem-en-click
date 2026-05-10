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
    
    // Fix `headers: });` issue
    content = content.replace(/headers:\s*\}\);/g, '});');
    content = content.replace(/headers:\s*\}\s*\}\)/g, '})');
    
    // Some files might have `headers: { ` that was mangled.
    content = content.replace(/headers:\s*\}\}/g, '}');
    content = content.replace(/headers:\s*\}\s*\}/g, '}');

    // And trailing commas with })
    content = content.replace(/,\s*\}\)/g, '})');
    
    fs.writeFileSync(filePath, content);
  }
});
