import fs from 'fs';

const files = [
  'src/components/marketplace/BookingsSection.tsx',
  'src/services/marketplaceService.ts',
  'src/services/aiService.ts'
];

files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace(/.*Authorization.*/g, '');
  c = c.replace(/.*const token.*localStorage.*/g, '');
  fs.writeFileSync(f, c);
});
