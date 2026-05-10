import express from 'express';
import { authenticateToken } from './auth.ts';
import prisma from '../lib/prisma.ts';

const router = express.Router();

// Get company profile
router.get('/profile', authenticateToken, async (req: any, res) => {
  try {
    let company = await prisma.company.findFirst({
      where: { userId: req.user.id }
    });
    
    if (!company) {
      company = await prisma.company.create({
        data: {
          userId: req.user.id,
          name: 'My Company',
          description: 'Company description',
        }
      });
    }
    
    res.json(company);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch company profile' });
  }
});

// Update company
router.put('/profile', authenticateToken, async (req: any, res) => {
  try {
    const { name, description, city, address, logoUrl } = req.body;
    
    const company = await prisma.company.findFirst({
      where: { userId: req.user.id }
    });
    
    if (!company) return res.status(404).json({ error: 'Company not found' });
    
    const updated = await prisma.company.update({
      where: { id: company.id },
      data: { name, description, city, address, logoUrl }
    });
    
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update company profile' });
  }
});

// Get projects (using GroupRequest for companies conceptually, or empty for now)
router.get('/projects', authenticateToken, async (req: any, res) => {
  try {
    // A simplified view: we return all GroupRequests created by this company user
    const projects = await prisma.groupRequest.findMany({
      where: { creatorId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Add project
router.post('/projects', authenticateToken, async (req: any, res) => {
  try {
    const { name, client, budget, deadline, description } = req.body;
    
    // Storing client in the title/desc for this simplified version
    // since there's no project model
    const title = name || 'New Project';
    const projectDesc = `Client: ${client}\nBudget: ${budget}\nDeadline: ${deadline}\n${description || ''}`;
    
    const project = await prisma.groupRequest.create({
      data: {
        creatorId: req.user.id,
        title,
        description: projectDesc,
        status: 'recruiting',
      }
    });
    
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add project' });
  }
});

export default router;
