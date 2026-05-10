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
    
    // Fix: headers: { 'Content-Type': 'application/json' }}, \n body: ...
    // to: headers: { 'Content-Type': 'application/json' }, \n body: ...
    content = content.replace(/headers:\s*\{\s*'Content-Type'\s*:\s*'application\/json'\s*\}\},/g, 
                             "headers: { 'Content-Type': 'application/json' },");
    
    // Any remaining `}},` should likely be `},` inside fetch calls
    content = content.replace(/\}\},/g, '},');

    fs.writeFileSync(filePath, content);
  }
});
