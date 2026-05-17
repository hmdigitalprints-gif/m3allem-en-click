# M3allem - Moroccan Artisan Marketplace

M3allem is a modern full-stack marketplace connecting skilled Moroccan artisans (plumbers, electricians, painters, etc.) with customers. It features real-time booking, internal wallet payments, and an AI-assisted diagnostic tool.

## 🚀 Environment Tiers

### 1. Local Development
- **Dev Server:** `npm run dev` (Runs on http://localhost:3000)
- **Database:** PostgreSQL (local or via Docker)
- **Port:** 3000

### 2. Staging (AI Studio Shared App)
The AI Studio **Shared App URL** serves as our staging environment for user flow verification and stakeholder review.
- **URL:** [Shared App URL](https://ais-pre-zdl57w2cgwakeufvjb7vm5-8146061417.europe-west3.run.app)
- **Purpose:** Verifying multi-user interactions, real-time notifications, and mobile responsiveness.

### 3. Production
The app is designed to be containerized using the provided `Dockerfile`.
- **Build:** `npm run build`
- **Start:** `npm run start`

## 🛠️ Setup

### Prerequisites
- Node.js 22+
- PostgreSQL
- Stripe Account (Optional, for online top-ups)

### Installation
1. Clone the repository.
2. Install dependencies: `npm install`
3. Configure environment variables: `cp .env.example .env`
4. Setup database: `npx prisma db push`
5. Seed data: `npx prisma db seed`

### Stripe Configuration
Stripe is optional. To enable it:
1. Visit the **Admin Dashboard** -> **Payment Settings**.
2. Enter your `sk_...` and `whsec_...` keys.
3. Toggle "Enable Stripe".

## 📦 Deployment
Use Docker Compose to spin up the full stack:
```bash
docker-compose up --build
```
