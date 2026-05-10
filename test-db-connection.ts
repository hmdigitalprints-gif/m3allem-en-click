import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  try {
     const count = await prisma.devis.count();
     console.log('Factures count:', count);
  } catch(e) {
     console.error('Error:', e.message);
  } finally {
     await prisma.$disconnect();
  }
}
run();
