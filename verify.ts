import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  await prisma.devis.count();
  console.log('success');
}
main().catch(console.error).finally(() => prisma.$disconnect());
