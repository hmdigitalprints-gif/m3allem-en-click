-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('client', 'artisan', 'seller', 'company', 'admin');

-- CreateEnum
CREATE TYPE "OtpChannel" AS ENUM ('sms', 'email');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "DeliveryMethod" AS ENUM ('home_service', 'pickup');

-- CreateEnum
CREATE TYPE "MaterialHandling" AS ENUM ('client_provides', 'artisan_provides', 'buy_from_store');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('pending', 'proposal_submitted', 'proposal_approved', 'en_route', 'in_progress', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'paid', 'failed', 'escrow');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('pending', 'accepted', 'ongoing', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "CommissionStatus" AS ENUM ('pending', 'paid');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('topup', 'payment', 'release', 'withdrawal', 'refund', 'commission');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('pending', 'completed', 'failed');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('cash', 'card', 'wallet', 'paypal', 'stripe', 'cmi');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('text', 'voice', 'image', 'location');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('sent', 'delivered', 'read');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('push', 'email', 'reminder');

-- CreateEnum
CREATE TYPE "GroupRequestStatus" AS ENUM ('recruiting', 'ready', 'accepted', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "ParticipantStatus" AS ENUM ('joined', 'paid', 'cancelled');

-- CreateEnum
CREATE TYPE "DisputeStatus" AS ENUM ('open', 'in_review', 'resolved', 'closed');

-- CreateEnum
CREATE TYPE "DevisStatus" AS ENUM ('brouillon', 'envoye', 'en_attente', 'accepte', 'refuse', 'expire');

-- CreateEnum
CREATE TYPE "FactureStatus" AS ENUM ('brouillon', 'envoyee', 'non_payee', 'partiellement_payee', 'payee', 'en_retard', 'annulee');

-- CreateTable
CREATE TABLE "languages" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "native_name" TEXT NOT NULL,
    "is_rtl" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "languages_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "translations" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "language_code" TEXT,
    "value" TEXT NOT NULL,

    CONSTRAINT "translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "role" "Role",
    "password_hash" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "verification_token" TEXT,
    "reset_token" TEXT,
    "reset_token_expires" TIMESTAMP(3),
    "avatar_url" TEXT,
    "points" INTEGER NOT NULL DEFAULT 0,
    "preferred_language" TEXT DEFAULT 'en',
    "city" TEXT,
    "address" TEXT,
    "last_verified" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stores" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "name" TEXT,
    "description" TEXT,
    "logo_url" TEXT,
    "city" TEXT,
    "address" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "store_id" TEXT,
    "name" TEXT,
    "description" TEXT,
    "price" DECIMAL(65,30),
    "category" TEXT,
    "image_url" TEXT,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "name" TEXT,
    "description" TEXT,
    "logo_url" TEXT,
    "city" TEXT,
    "address" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otps" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "code" TEXT,
    "expires_at" TIMESTAMP(3),
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "otp_hash" TEXT,
    "channel" "OtpChannel",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phone_verifications" (
    "id" TEXT NOT NULL,
    "phone_number" TEXT,
    "otp_hash" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "verified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "phone_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "artisan_verifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "id_document" TEXT,
    "video_url" TEXT,
    "skills" TEXT,
    "professional_license" TEXT,
    "status" "VerificationStatus" DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "artisan_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "commission_rate" DECIMAL(65,30),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "translations" JSONB,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "artisans" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "category_id" TEXT,
    "bio" TEXT,
    "expertise" TEXT,
    "years_experience" INTEGER NOT NULL DEFAULT 0,
    "certifications" TEXT,
    "rating" DECIMAL(65,30) DEFAULT 0,
    "review_count" INTEGER NOT NULL DEFAULT 0,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "is_online" BOOLEAN NOT NULL DEFAULT false,
    "city" TEXT,
    "latitude" DECIMAL(65,30),
    "longitude" DECIMAL(65,30),
    "service_radius" DECIMAL(65,30) DEFAULT 10,
    "preferred_cities" JSONB,
    "working_hours" JSONB,

    CONSTRAINT "artisans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favorites" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "artisan_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "artisan_portfolio" (
    "id" TEXT NOT NULL,
    "artisan_id" TEXT,
    "title" TEXT,
    "description" TEXT,
    "image_url" TEXT,
    "video_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "artisan_portfolio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services" (
    "id" TEXT NOT NULL,
    "category_id" TEXT,
    "artisan_id" TEXT,
    "title" TEXT,
    "description" TEXT,
    "price" DECIMAL(65,30),
    "category_name" TEXT,
    "image_url" TEXT,
    "translations" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "client_id" TEXT,
    "artisan_id" TEXT,
    "service_id" TEXT,
    "delivery_method" "DeliveryMethod",
    "location_lat" DECIMAL(65,30),
    "location_lng" DECIMAL(65,30),
    "city" TEXT,
    "proof_before_client" TEXT,
    "material_handling" "MaterialHandling" DEFAULT 'client_provides',
    "material_cost" DECIMAL(65,30) DEFAULT 0,
    "artisan_proposed_price" DECIMAL(65,30),
    "artisan_proposal_comments" TEXT,
    "required_materials" JSONB,
    "client_approved_proposal" BOOLEAN NOT NULL DEFAULT false,
    "proof_during_service" TEXT,
    "proof_after_service" TEXT,
    "price" DECIMAL(65,30),
    "payment_method" TEXT DEFAULT 'cash',
    "payment_status" "PaymentStatus" DEFAULT 'pending',
    "booking_status" "BookingStatus" DEFAULT 'pending',
    "admin_amount" DECIMAL(65,30),
    "artisan_amount" DECIMAL(65,30),
    "scheduled_at" TIMESTAMP(3),
    "is_urgent" BOOLEAN NOT NULL DEFAULT false,
    "attachments" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "client_id" TEXT,
    "artisan_id" TEXT,
    "service_id" TEXT,
    "status" "OrderStatus",
    "price" DECIMAL(65,30),
    "commission_amount" DECIMAL(65,30),
    "location_lat" DECIMAL(65,30),
    "location_lng" DECIMAL(65,30),
    "address" TEXT,
    "city" TEXT,
    "description" TEXT,
    "is_urgent" BOOLEAN NOT NULL DEFAULT false,
    "proposed_price" DECIMAL(65,30),
    "attachments" JSONB,
    "points_earned" INTEGER NOT NULL DEFAULT 0,
    "points_used" INTEGER NOT NULL DEFAULT 0,
    "discount_amount" DECIMAL(65,30) DEFAULT 0,
    "package_id" TEXT,
    "group_request_id" TEXT,
    "commission_status" "CommissionStatus" DEFAULT 'pending',
    "scheduled_at" TIMESTAMP(3),
    "started_at" TIMESTAMP(3),
    "finished_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallets" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "balance" DECIMAL(65,30) DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "wallet_id" TEXT,
    "amount" DECIMAL(65,30),
    "type" "TransactionType",
    "status" "TransactionStatus",
    "description" TEXT,
    "reference_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "order_id" TEXT,
    "amount" DECIMAL(65,30),
    "method" "PaymentMethod",
    "status" "PaymentStatus",
    "transaction_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ratings" (
    "id" TEXT NOT NULL,
    "order_id" TEXT,
    "client_id" TEXT,
    "artisan_id" TEXT,
    "stars" INTEGER,
    "review" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "booking_id" TEXT,

    CONSTRAINT "ratings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "order_id" TEXT,
    "sender_id" TEXT,
    "receiver_id" TEXT,
    "content" TEXT,
    "type" "MessageType" DEFAULT 'text',
    "audio_url" TEXT,
    "image_url" TEXT,
    "latitude" DECIMAL(65,30),
    "longitude" DECIMAL(65,30),
    "status" "MessageStatus" DEFAULT 'sent',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "title" TEXT,
    "message" TEXT,
    "type" "NotificationType",
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "link" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proposals" (
    "id" TEXT NOT NULL,
    "order_id" TEXT,
    "artisan_id" TEXT,
    "price" DECIMAL(65,30),
    "status" "OrderStatus" DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proposals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "packages" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "price" DECIMAL(65,30),
    "discount_percentage" DECIMAL(65,30),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "package_services" (
    "package_id" TEXT NOT NULL,
    "service_id" TEXT NOT NULL,

    CONSTRAINT "package_services_pkey" PRIMARY KEY ("package_id","service_id")
);

-- CreateTable
CREATE TABLE "group_requests" (
    "id" TEXT NOT NULL,
    "creator_id" TEXT,
    "artisan_id" TEXT,
    "service_id" TEXT,
    "title" TEXT,
    "description" TEXT,
    "status" "GroupRequestStatus" DEFAULT 'recruiting',
    "min_participants" INTEGER NOT NULL DEFAULT 2,
    "max_participants" INTEGER,
    "current_price_per_user" DECIMAL(65,30),
    "location_lat" DECIMAL(65,30),
    "location_lng" DECIMAL(65,30),
    "address" TEXT,
    "scheduled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "group_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_request_participants" (
    "group_request_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" "ParticipantStatus" NOT NULL DEFAULT 'joined',
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "group_request_participants_pkey" PRIMARY KEY ("group_request_id","user_id")
);

-- CreateTable
CREATE TABLE "disputes" (
    "id" TEXT NOT NULL,
    "order_id" TEXT,
    "client_id" TEXT,
    "artisan_id" TEXT,
    "reason" TEXT,
    "description" TEXT,
    "status" "DisputeStatus" DEFAULT 'open',
    "resolution" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "disputes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_plans" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "price" DECIMAL(65,30),
    "duration_days" INTEGER,
    "features" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fraud_alerts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "reason" TEXT,
    "risk_level" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fraud_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "action" TEXT,
    "entity_type" TEXT,
    "entity_id" TEXT,
    "details" TEXT,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_clients" (
    "id" TEXT NOT NULL,
    "creator_id" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "company" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "devis" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "creator_id" TEXT,
    "client_id" TEXT,
    "status" "DevisStatus" NOT NULL DEFAULT 'brouillon',
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valid_until" TIMESTAMP(3),
    "subtotal" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "tax" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "discount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "total" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "terms" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "devis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "devis_items" (
    "id" TEXT NOT NULL,
    "devis_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unit_price" DECIMAL(65,30) NOT NULL,
    "tax_rate" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "total" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "devis_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "factures" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "creator_id" TEXT,
    "client_id" TEXT,
    "status" "FactureStatus" NOT NULL DEFAULT 'brouillon',
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "due_date" TIMESTAMP(3),
    "subtotal" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "tax" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "discount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "total" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "amount_paid" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "terms" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "factures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facture_items" (
    "id" TEXT NOT NULL,
    "facture_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unit_price" DECIMAL(65,30) NOT NULL,
    "tax_rate" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "total" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "facture_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "translations_key_language_code_key" ON "translations"("key", "language_code");

-- CreateIndex
CREATE UNIQUE INDEX "settings_key_key" ON "settings"("key");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "artisans_user_id_key" ON "artisans"("user_id");

-- CreateIndex
CREATE INDEX "artisans_category_id_city_idx" ON "artisans"("category_id", "city");

-- CreateIndex
CREATE INDEX "artisans_is_verified_rating_idx" ON "artisans"("is_verified", "rating");

-- CreateIndex
CREATE UNIQUE INDEX "wallets_user_id_key" ON "wallets"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "cities_name_key" ON "cities"("name");

-- CreateIndex
CREATE UNIQUE INDEX "devis_number_key" ON "devis"("number");

-- CreateIndex
CREATE UNIQUE INDEX "factures_number_key" ON "factures"("number");

-- AddForeignKey
ALTER TABLE "translations" ADD CONSTRAINT "translations_language_code_fkey" FOREIGN KEY ("language_code") REFERENCES "languages"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stores" ADD CONSTRAINT "stores_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "otps" ADD CONSTRAINT "otps_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artisan_verifications" ADD CONSTRAINT "artisan_verifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artisans" ADD CONSTRAINT "artisans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artisans" ADD CONSTRAINT "artisans_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_artisan_id_fkey" FOREIGN KEY ("artisan_id") REFERENCES "artisans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artisan_portfolio" ADD CONSTRAINT "artisan_portfolio_artisan_id_fkey" FOREIGN KEY ("artisan_id") REFERENCES "artisans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_artisan_id_fkey" FOREIGN KEY ("artisan_id") REFERENCES "artisans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_artisan_id_fkey" FOREIGN KEY ("artisan_id") REFERENCES "artisans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_artisan_id_fkey" FOREIGN KEY ("artisan_id") REFERENCES "artisans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "wallets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_artisan_id_fkey" FOREIGN KEY ("artisan_id") REFERENCES "artisans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_artisan_id_fkey" FOREIGN KEY ("artisan_id") REFERENCES "artisans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_services" ADD CONSTRAINT "package_services_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_services" ADD CONSTRAINT "package_services_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_requests" ADD CONSTRAINT "group_requests_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_requests" ADD CONSTRAINT "group_requests_artisan_id_fkey" FOREIGN KEY ("artisan_id") REFERENCES "artisans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_requests" ADD CONSTRAINT "group_requests_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_request_participants" ADD CONSTRAINT "group_request_participants_group_request_id_fkey" FOREIGN KEY ("group_request_id") REFERENCES "group_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_request_participants" ADD CONSTRAINT "group_request_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_artisan_id_fkey" FOREIGN KEY ("artisan_id") REFERENCES "artisans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fraud_alerts" ADD CONSTRAINT "fraud_alerts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_clients" ADD CONSTRAINT "document_clients_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devis" ADD CONSTRAINT "devis_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devis" ADD CONSTRAINT "devis_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "document_clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devis_items" ADD CONSTRAINT "devis_items_devis_id_fkey" FOREIGN KEY ("devis_id") REFERENCES "devis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "factures" ADD CONSTRAINT "factures_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "factures" ADD CONSTRAINT "factures_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "document_clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facture_items" ADD CONSTRAINT "facture_items_facture_id_fkey" FOREIGN KEY ("facture_id") REFERENCES "factures"("id") ON DELETE CASCADE ON UPDATE CASCADE;

