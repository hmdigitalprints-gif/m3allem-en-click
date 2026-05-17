# Staging & QA Flow

This document outlines the procedure for testing the application in the staging environment (AI Studio Shared Preview).

## 🧪 Full User Flow Checklist

### 1. Customer Onboarding
- [ ] Sign up as a customer.
- [ ] Verify profile details update.
- [ ] Top up wallet (requires Admin Stripe config or manual DB top-up).

### 2. Marketplace & Booking
- [ ] Search for an artisan by category.
- [ ] Open an artisan profile.
- [ ] Start a booking request.
- [ ] Use AI Diagnostic to refine work requirements.
- [ ] Confirm booking.

### 3. Payment Flow
- [ ] **Wallet Payment:** Ensure balance is deducted and artisan receives amount (minus commission).
- [ ] **Cash Payment:** Ensure booking marks as "pending" for cash collection.

### 4. Artisan Lifecycle
- [ ] Sign up as an artisan.
- [ ] Submit verification documents (Admin must approve in Admin Panel).
- [ ] Toggle "Online" status.
- [ ] Accept/Reject incoming bookings.
- [ ] Complete job and confirm payment (for cash jobs).

### 5. Admin Panel
- [ ] Access `/admin` (requires admin role).
- [ ] Manage categories and commission rates.
- [ ] Review withdrawal requests.
- [ ] Configure Stripe keys in **Payment Settings**.

## 🔄 Deployment to Staging
Every change pushed to the main branch (or saved in AI Studio) is automatically reflected in the Development and Shared previews.

**Staging URL:** https://ais-pre-zdl57w2cgwakeufvjb7vm5-8146061417.europe-west3.run.app
