// fix_frontend.js
import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

function removeTokenLogic(content) {
  // Remove instances of getting/setting/removing the token from localStorage
  content = content.replace(/.*(?:const|let|var)\s+\w+\s*=\s*localStorage\.getItem\(['"`]m3allem_token['"`]\);?.*\n?/g, '');
  content = content.replace(/.*localStorage\.(?:removeItem|setItem)\(['"`]m3allem_token.*[^;];?\n?/g, '');
  content = content.replace(/.*localStorage\.(?:removeItem|setItem)\(['"`]token(['"`]).*[^;];?\n?/g, '');
  
  // Remove Authorization header completely
  content = content.replace(/['"`]?Authorization['"`]?\s*:\s*`Bearer \$\{?[^`]*\}?`\s*,?/g, '');
  content = content.replace(/['"`]?Authorization['"`]?\s*:\s*['"`]Bearer ['"`]\s*\+\s*[^,}]*,?/g, '');
  
  // Add credentials: 'include' to fetch calls if it doesn't have it
  // This is tricky with simple regex, but we can do a naive replace:
  // If we see fetch( url, { ... } ), we inject credentials: 'include'
  // Let's use a simpler approach:
  const fetchRegex = /fetch\s*\(\s*([^,]+)\s*,\s*({)([^}]+})/g;
  content = content.replace(fetchRegex, (match, url, brace, optionsInner) => {
    if (!optionsInner.includes('credentials') && url.includes('/api/')) {
       return `fetch(${url}, { credentials: 'include', ${optionsInner}}`;
    }
    return match;
  });
  
  // What if fetch has no options?
  const fetchNoOpts = /fetch\s*\(\s*([^,)]+)\s*\)/g;
  content = content.replace(fetchNoOpts, (match, url) => {
    if (url.includes('/api/') || url.includes('`${')) { // likely an API call 
       return `fetch(${url}, { credentials: 'include' })`;
    }
    return match;
  });
  
  return content;
}

walkDir('./src', (filePath) => {
  if (filePath.endsWith('.js') || filePath.endsWith('.ts') || filePath.endsWith('.tsx') || filePath.endsWith('.jsx')) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let newContent = removeTokenLogic(content);
    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent);
      console.log('Fixed', filePath);
    }
  }
});

// Also fix server/routes/auth.ts to use maxAge in ms
