import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function seed() {
  const categoriesCount = await prisma.category.count();
  if (categoriesCount === 0) {
    console.log("Seeding initial categories...");
    await prisma.category.createMany({
      data: [
        { name: 'Plumbing', icon: 'Droplets', commissionRate: 0.1, translations: { fr: 'Plomberie', ar: 'سباكة' } },
        { name: 'Electrical', icon: 'Zap', commissionRate: 0.1, translations: { fr: 'Électricité', ar: 'كهرباء' } },
        { name: 'Painting', icon: 'Paintbrush', commissionRate: 0.1, translations: { fr: 'Peinture', ar: 'صباغة' } },
        { name: 'Carpentry', icon: 'Hammer', commissionRate: 0.1, translations: { fr: 'Menuiserie', ar: 'نجارة' } }
      ]
    });
    console.log("Categories seeded.");
  }
}

seed()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
