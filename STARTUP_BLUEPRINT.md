# M3allem En Click - Startup Blueprint & Technical Architecture

## 1. Product Structure

### Customer Side
- **Onboarding**: Phone + OTP verification (Firebase Auth).
- **Discovery**: AI-powered search, category browsing, and "Top Rated" recommendations.
- **Booking**: Instant "M3allem Now" (Indrive-style bidding) or scheduled appointments.
- **Tracking**: Real-time map view of the craftsman's journey.
- **Payments**: Multi-modal (Cash, Wallet, Card via Stripe/M-Pesa/Local Gateways).
- **Communication**: In-app encrypted chat and VOIP calling.
- **Trust**: Verified reviews with photo uploads.

### Craftsman Side
- **KYC**: Identity verification (ID scan, background check).
- **Inventory**: Portfolio of past work, tools list, and certifications.
- **Job Engine**: Real-time request feed with distance and estimated earnings.
- **Wallet**: Transparent breakdown of earnings, commissions, and instant payouts.
- **Schedule**: Availability toggle and calendar management.

### Admin Dashboard
- **Control Center**: User/Craftsman lifecycle management.
- **Financials**: Commission configuration per category, tax reporting, and fraud alerts.
- **Analytics**: Heatmaps of service demand, churn rates, and LTV (Lifetime Value).

---

## 2. Service Categories (Professional List)
1. **Plumbing**: Leak repair, pipe installation, water heater service.
2. **Electrical**: Wiring, panel upgrades, lighting installation.
3. **Carpentry**: Furniture repair, custom cabinetry, door/window fixing.
4. **Painting**: Interior/Exterior, decorative finishes, wallpaper.
5. **Cleaning**: Deep clean, post-construction, office maintenance.
6. **Appliance Repair**: Fridge, washing machine, oven, microwave.
7. **HVAC**: AC installation, filter cleaning, heating systems.
8. **Construction**: Masonry, tiling, drywall, structural repairs.
9. **Gardening**: Landscaping, irrigation, lawn care.
10. **Smart Home**: Security cameras, smart locks, IoT setup.

---

## 3. AI Features
- **Smart Search**: Natural language processing to understand "My sink is leaking and making a weird noise" -> Suggests Plumbing.
- **Dynamic Pricing**: AI estimates job cost based on description, historical data, and current demand.
- **Fraud Detection**: Identifies suspicious patterns (e.g., fake reviews, off-platform payment attempts).
- **Matchmaking**: Suggests the "Best Value" vs "Highest Rated" vs "Fastest Arrival".

---

## 4. System Architecture (Scalable Microservices)

### High-Level Components
- **API Gateway**: Kong or AWS API Gateway for routing, rate limiting, and auth.
- **Auth Service**: Centralized identity management (JWT + OAuth2).
- **Order Service**: Manages state machine for bookings (Pending -> Accepted -> Ongoing -> Done).
- **Matching Engine**: High-performance service using Redis Geospatial for nearby discovery.
- **Payment Service**: Integration with Stripe/Paypal and internal Wallet ledger.
- **Notification Service**: Multi-channel (FCM, SMS, Email).
- **Chat Service**: WebSocket-based real-time messaging with persistence.

### Infrastructure
- **Database**: PostgreSQL (Primary) + Redis (Caching/Real-time).
- **Storage**: AWS S3 for user avatars and job photos.
- **Compute**: Docker containers on AWS EKS (Kubernetes) for auto-scaling.

---

## 5. Database Schema (Relational)

### Core Tables
- `users`: `id, phone, email, role, status, metadata`
- `craftsmen`: `user_id, category_id, bio, rating, is_verified, wallet_id`
- `categories`: `id, name, icon_url, base_commission`
- `bookings`: `id, customer_id, craftsman_id, status, price, lat, lng, scheduled_at`
- `payments`: `id, booking_id, amount, method, commission_taken, status`
- `wallets`: `id, owner_id, balance, currency`
- `reviews`: `id, booking_id, rating, comment, photos[]`

---

## 6. Payment & Commission System
- **Commission Logic**: 
  - Admin sets % per category (e.g., 10% for Plumbing, 15% for Cleaning).
  - **Cash**: Craftsman's wallet balance goes negative by the commission amount. They must "top up" to keep receiving jobs.
  - **Digital**: Split payment at source. 90% to Craftsman, 10% to Admin.
- **Payouts**: Weekly or instant "Express Payout" for a small fee.

---

## 7. UI/UX Design Philosophy
- **Luxury Modern**: Deep blacks (`#0A0A0A`), Gold accents (`#FFD700`), and pure whites.
- **Minimalism**: High whitespace, oversized typography, and subtle glassmorphism.
- **Navigation**: Bottom-tab bar for primary actions, gesture-based interactions.

---

## 8. Business Model
- **Transaction Fee**: 10-20% commission on every job.
- **Premium Craftsmen**: Monthly subscription for "Top Search" placement and lower commissions.
- **Lead Generation**: Selling high-quality leads to construction firms for large projects.
- **B2B**: Maintenance contracts for property management companies.

---

## 9. Security & Trust
- **Identity**: Mandatory government ID verification via Onfido/Jumio.
- **Escrow**: Payments held in escrow until customer confirms job completion.
- **Insurance**: "M3allem Guarantee" covering up to $1,000 in damages.

---

## 10. Scaling Plan
- **Phase 1 (MVP)**: Launch in 1 major city, focus on 3 core categories (Plumbing, Electric, Cleaning).
- **Phase 2 (Regional)**: Expand to 5 cities, introduce AI price estimation.
- **Phase 3 (National)**: Full category rollout, loyalty programs.
- **Phase 4 (International)**: Localization for neighboring markets, cross-border payments.

---

## MVP Development Roadmap (12 Weeks)
- **Weeks 1-3**: Backend core, DB schema, and Auth.
- **Weeks 4-6**: Customer App (Discovery & Booking) + Craftsman App (Job Feed).
- **Weeks 7-9**: Payment integration, Real-time tracking, and Chat.
- **Weeks 10-12**: Admin Dashboard, AI category detection, and Beta testing.
