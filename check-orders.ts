import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  try {
     console.log('Checking productOrder table...');
     const count = await prisma.productOrder.count();
     console.log('productOrder count:', count);
  } catch(e) {
     console.error('Error:', e.message);
  } finally {
     await prisma.$disconnect();
  }
}
run();
