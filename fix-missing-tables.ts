import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  try {
    console.log('Creating missing tables...');
    
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "product_orders" (
          "id" TEXT NOT NULL,
          "store_id" TEXT NOT NULL,
          "client_id" TEXT NOT NULL,
          "status" TEXT NOT NULL DEFAULT 'pending',
          "total_price" DECIMAL(65,30) NOT NULL,
          "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updated_at" TIMESTAMP(3) NOT NULL,

          CONSTRAINT "product_orders_pkey" PRIMARY KEY ("id")
      );
    `);
    
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "product_order_items" (
          "id" TEXT NOT NULL,
          "product_order_id" TEXT NOT NULL,
          "product_id" TEXT NOT NULL,
          "quantity" INTEGER NOT NULL DEFAULT 1,
          "price_at_time" DECIMAL(65,30) NOT NULL,

          CONSTRAINT "product_order_items_pkey" PRIMARY KEY ("id")
      );
    `);

    console.log('Adding foreign keys...');
    
    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "product_orders" ADD CONSTRAINT "product_orders_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
      `);
    } catch (e) { console.warn('Note: FK for store_id might already exist or failed:', e.message); }

    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "product_orders" ADD CONSTRAINT "product_orders_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
      `);
    } catch (e) { console.warn('Note: FK for client_id might already exist or failed:', e.message); }

    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "product_order_items" ADD CONSTRAINT "product_order_items_product_order_id_fkey" FOREIGN KEY ("product_order_id") REFERENCES "product_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      `);
    } catch (e) { console.warn('Note: FK for product_order_id might already exist or failed:', e.message); }

    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "product_order_items" ADD CONSTRAINT "product_order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
      `);
    } catch (e) { console.warn('Note: FK for product_id might already exist or failed:', e.message); }

    console.log('Success: Tables and FKs ensured.');
  } catch(e) {
    console.error('Migration script failed:', e);
  } finally {
    await prisma.$disconnect();
  }
}

run();
