import express from 'express';
import { authenticateToken } from './auth.ts';
import prisma from '../lib/prisma.ts';

const router = express.Router();

// Get seller's store
router.get('/store', authenticateToken, async (req: any, res) => {
  try {
    let store = await prisma.store.findFirst({
      where: { userId: req.user.id }
    });
    
    if (!store) {
      store = await prisma.store.create({
        data: {
          userId: req.user.id,
          name: 'My Store',
          description: 'Store description',
        }
      });
    }
    
    res.json(store);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch store' });
  }
});

// Update store
router.put('/store', authenticateToken, async (req: any, res) => {
  try {
    const { name, description, city, address, logoUrl } = req.body;
    
    const store = await prisma.store.findFirst({
      where: { userId: req.user.id }
    });
    
    if (!store) return res.status(404).json({ error: 'Store not found' });
    
    const updated = await prisma.store.update({
      where: { id: store.id },
      data: { name, description, city, address, logoUrl }
    });
    
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update store' });
  }
});

// Get products
router.get('/products', authenticateToken, async (req: any, res) => {
  try {
    const store = await prisma.store.findFirst({
      where: { userId: req.user.id }
    });
    
    if (!store) return res.json([]);
    
    const products = await prisma.product.findMany({
      where: { storeId: store.id },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Add product
router.post('/products', authenticateToken, async (req: any, res) => {
  try {
    const { name, description, price, category, stock, imageUrl } = req.body;
    
    const store = await prisma.store.findFirst({
      where: { userId: req.user.id }
    });
    
    if (!store) return res.status(404).json({ error: 'Store not found' });
    
    const product = await prisma.product.create({
      data: {
        storeId: store.id,
        name,
        description,
        price: price ? parseFloat(price) : 0,
        category,
        stock: stock ? parseInt(stock) : 0,
        imageUrl
      }
    });
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add product' });
  }
});

// Get recent orders
router.get('/orders', authenticateToken, async (req: any, res) => {
  try {
    const store = await prisma.store.findFirst({
      where: { userId: req.user.id }
    });
    
    if (!store) return res.json([]);
    
    const orders = await prisma.productOrder.findMany({
      where: { storeId: store.id },
      include: {
        client: { select: { id: true, name: true, avatarUrl: true } },
        items: {
          include: {
            product: { select: { id: true, name: true, imageUrl: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Update order status
router.patch('/orders/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Verify store owns the order
    const store = await prisma.store.findFirst({
      where: { userId: req.user.id }
    });
    if (!store) return res.status(404).json({ error: 'Store not found' });
    
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const order = await prisma.productOrder.findUnique({
      where: { id }
    });
    if (!order || order.storeId !== store.id) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const updated = await prisma.productOrder.update({
      where: { id },
      data: { status }
    });
    
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

export default router;
