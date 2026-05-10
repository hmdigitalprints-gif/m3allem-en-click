import { execSync } from 'child_process';
try {
  execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
  console.log('Success');
} catch (e) {
  console.error(e);
}
