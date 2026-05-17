import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.ts";
import { Role } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { authenticateAdmin } from "./auth.ts";

const router = express.Router();

// Block simulation routes in production for security
router.use((req, res, next) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(403).json({ error: "Simulation engine disabled in production" });
  }
  next();
});
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is missing.");
}
const JWT_SECRET = process.env.JWT_SECRET;

// Realistic Data Constants
const CATEGORIES = [
  { name: "Plumbing", icon: "wrench", image: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7" },
  { name: "Electrical", icon: "zap", image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4" },
  { name: "Cleaning", icon: "sparkles", image: "https://images.unsplash.com/photo-1581578731548-c64695cc6954" },
  { name: "Gardening", icon: "leaf", image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae" },
  { name: "Construction", icon: "hammer", image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd" },
  { name: "Painting", icon: "palette", image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f" },
  { name: "HVAC", icon: "thermometer", image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd" },
];

const CITIES = ["Casablanca", "Rabat", "Marrakech", "Tangier", "Agadir", "Fes", "Meknes", "Oujda", "Tetouan"];

const REAL_NAMES = [
  "Mohammed El Amrani", "Yassine Benjelloun", "Amine Tazi", "Omar Mansouri", 
  "Fatima Zahra Bennani", "Siham Alaoui", "Khadija Idrissi", "Leila Mezouar",
  "Ahmed Chraibi", "Hassan Filali", "Youssef Belkhayat", "Zineb Berrada"
];

const AVATARS = [
  "https://i.pravatar.cc/150?u=1", "https://i.pravatar.cc/150?u=2", "https://i.pravatar.cc/150?u=3",
  "https://i.pravatar.cc/150?u=4", "https://i.pravatar.cc/150?u=5", "https://i.pravatar.cc/150?u=6"
];

const PORTFOLIO_IMAGES = [
  "https://images.unsplash.com/photo-1503387762-592be5a52680",
  "https://images.unsplash.com/photo-1581094794329-c8112a89af12",
  "https://images.unsplash.com/photo-1584622650111-993a426fbf0a",
  "https://images.unsplash.com/photo-1595113316349-9fa4eb24f884",
  "https://images.unsplash.com/photo-1562259949-e8e7689d7828"
];

router.post("/seed", authenticateAdmin, async (req, res) => {
  try {
    console.log("[Simulation] Starting hyper-realistic database seed...");

    const passwordHash = await bcrypt.hash("password123", 10);

    // 1. Categories
    for (const cat of CATEGORIES) {
      await prisma.category.upsert({
        where: { name: cat.name },
        update: {},
        create: { name: cat.name, icon: cat.icon, isActive: true },
      });
    }
    const categories = await prisma.category.findMany();

    // 2. Create Admin
    await prisma.user.upsert({
      where: { email: "admin@test.com" },
      update: {},
      create: {
        email: "admin@test.com",
        name: "Admin M3allem",
        role: "admin",
        passwordHash,
        verified: true,
        emailVerified: true
      },
    });

    // 3. Create Multiple Clients (5 Clients)
    const clients = [];
    for (let i = 0; i < 5; i++) {
        const client = await prisma.user.upsert({
            where: { email: `client${i}@test.com` },
            update: {},
            create: {
                email: `client${i}@test.com`,
                name: REAL_NAMES[i % REAL_NAMES.length],
                phone: `+2126${Math.floor(10000000 + Math.random() * 90000000)}`,
                role: "client",
                passwordHash,
                verified: true,
                emailVerified: true,
                city: CITIES[Math.floor(Math.random() * CITIES.length)],
                avatarUrl: AVATARS[i % AVATARS.length]
            },
        });
        clients.push(client);
    }

    // 4. Create Multiple Artisans (10 Artisans with full profiles)
    const artisans = [];
    for (let i = 0; i < 10; i++) {
        const user = await prisma.user.upsert({
            where: { email: `artisan${i}@test.com` },
            update: {},
            create: {
                email: `artisan${i}@test.com`,
                name: REAL_NAMES[(i + 5) % REAL_NAMES.length],
                phone: `+2126${Math.floor(10000000 + Math.random() * 90000000)}`,
                role: "artisan",
                passwordHash,
                verified: true,
                emailVerified: true,
                city: CITIES[Math.floor(Math.random() * CITIES.length)],
                avatarUrl: AVATARS[(i + 2) % AVATARS.length]
            },
        });

        const artisan = await prisma.artisan.upsert({
            where: { userId: user.id },
            update: {
                rating: 4.0 + Math.random() * 1.0,
                reviewCount: Math.floor(Math.random() * 50),
                isOnline: Math.random() > 0.5
            },
            create: {
                userId: user.id,
                categoryId: categories[i % categories.length].id,
                bio: `Professional ${categories[i % categories.length].name} with extensive experience in ${user.city}.`,
                yearsExperience: Math.floor(Math.random() * 15) + 2,
                isVerified: Math.random() > 0.3,
                rating: 4.5,
                reviewCount: 12,
                city: user.city,
                isOnline: Math.random() > 0.5,
                workingHours: {
                    monday: { active: true, start: "08:00", end: "18:00" },
                    tuesday: { active: true, start: "08:00", end: "18:00" },
                    wednesday: { active: true, start: "08:00", end: "18:00" },
                    thursday: { active: true, start: "08:00", end: "18:00" },
                    friday: { active: true, start: "08:00", end: "12:00" },
                    saturday: { active: false },
                    sunday: { active: false }
                }
            },
        });

        // Add Portfolio items
        for(let p = 0; p < 3; p++) {
            await prisma.artisanPortfolio.create({
                data: {
                    artisanId: artisan.id,
                    title: `Project ${p + 1}`,
                    description: "Completed large scale installation",
                    imageUrl: PORTFOLIO_IMAGES[Math.floor(Math.random() * PORTFOLIO_IMAGES.length)]
                }
            });
        }

        // Add Services
        await prisma.service.create({
            data: {
                artisanId: artisan.id,
                categoryId: artisan.categoryId,
                title: `Standard ${categories[i % categories.length].name} Service`,
                description: "Full inspection and repair with warranty.",
                price: 200 + Math.random() * 500
            }
        });

        artisans.push(artisan);
    }

    // 5. Create Sellers & Stores (3)
    for (let i = 0; i < 3; i++) {
        const user = await prisma.user.upsert({
            where: { email: `seller${i}@test.com` },
            update: {},
            create: {
                email: `seller${i}@test.com`,
                name: `Store Owner ${i}`,
                role: "seller",
                passwordHash,
                verified: true,
                emailVerified: true
            },
        });

        let store = await prisma.store.findFirst({ where: { userId: user.id }});
        if (!store) {
            store = await prisma.store.create({
                data: {
                    userId: user.id,
                    name: `Brico Center ${CITIES[i]}`,
                    description: "Supplier of professional grade construction materials.",
                    city: CITIES[i]
                }
            });
        }

        // Add Products
        for(let j = 0; j < 5; j++) {
            await prisma.product.create({
                data: {
                    storeId: store.id,
                    name: `Professional Tool ${j + 1}`,
                    description: "Durable and efficient tool for professional use.",
                    price: 499 + (j * 100),
                    stock: 20,
                    category: "Tools",
                    imageUrl: "https://images.unsplash.com/photo-1534394416960-c22f97128b0b"
                }
            });
        }
    }

    // 6. Create Enterprise / Companies (3)
    for (let i = 0; i < 3; i++) {
        const user = await prisma.user.upsert({
            where: { email: `company${i}@test.com` },
            update: {},
            create: {
                email: `company${i}@test.com`,
                name: `Enterprise Manager ${i}`,
                role: "company",
                passwordHash,
                verified: true,
                emailVerified: true
            },
        });

        let company = await prisma.company.findFirst({ where: { userId: user.id }});
        if (!company) {
            company = await prisma.company.create({
                data: {
                    userId: user.id,
                    name: `Elite Maintenance ${CITIES[i]} S.A.R.L`,
                    description: "Specialized in large scale facility management.",
                    city: CITIES[i]
                }
            });
        }
    }

    // 7. Generate Complex Booking History (50 Bookings)
    const statuses = ['pending', 'proposal_approved', 'completed', 'cancelled', 'in_progress'];
    const reviews = [
        "Excellent work, very professional!",
        "Highly recommended for complex plumbing jobs.",
        "A bit late but the quality was great.",
        "Standard service, nothing special.",
        "Amazing experience, saved my day!"
    ];

    for (let i = 0; i < 50; i++) {
        const client = clients[Math.floor(Math.random() * clients.length)];
        const artisan = artisans[Math.floor(Math.random() * artisans.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        
        const booking = await prisma.booking.create({
            data: {
                clientId: client.id,
                artisanId: artisan.id,
                bookingStatus: status as any,
                price: 150 + Math.random() * 1000,
                city: artisan.city,
                scheduledAt: new Date(Date.now() + (Math.random() * 10 - 5) * 86400000),
                paymentStatus: status === 'completed' ? 'paid' : 'pending',
                adminAmount: status === 'completed' ? 50 : 0
            }
        });

        // Add Review if completed
        if (status === 'completed') {
            await prisma.rating.create({
                data: {
                    bookingId: booking.id,
                    clientId: client.id,
                    artisanId: artisan.id,
                    stars: Math.floor(Math.random() * 2) + 4, // 4-5 stars
                    review: reviews[Math.floor(Math.random() * reviews.length)]
                }
            });
        }
    }

    // 7. Simulating Chats & Notifications
    for (let i = 0; i < 10; i++) {
        const client = clients[Math.floor(Math.random() * clients.length)];
        const artisan = artisans[Math.floor(Math.random() * artisans.length)];
        
        const artisanUser = await prisma.user.findUnique({ where: { id: artisan.userId } });

        await prisma.message.create({
            data: {
                senderId: client.id,
                receiverId: artisan.userId,
                content: "Is this service available tomorrow?",
                status: "read"
            }
        });

        if (artisanUser) {
            await prisma.notification.create({
                data: {
                    userId: artisan.userId,
                    title: "New Message",
                    message: "You have a new inquiry from a client.",
                    type: "push",
                    isRead: false
                }
            });
        }
    }

    console.log("[Simulation] Hyper-realistic seed completed.");
    res.json({ 
        message: "Hyper-realistic seed completed successfully",
        stats: {
            clients: clients.length,
            artisans: artisans.length,
            bookings: 50,
            messages: 10
        }
    });
  } catch (error: any) {
    console.error("[Simulation] Seed error:", error.message || error);
    res.status(500).json({ error: "Seed failed", details: error.message || error });
  }
});

router.post("/login-as", authenticateAdmin, async (req, res) => {
  const { email } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        verified: user.verified,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
});

export default router;
