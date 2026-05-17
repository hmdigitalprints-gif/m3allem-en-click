# M3allem Deployment Guide

Complete guide for deploying M3allem to production.

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Setup](#environment-setup)
3. [Database Migration](#database-migration)
4. [Docker Deployment](#docker-deployment)
5. [Cloud Run Deployment](#cloud-run-deployment)
6. [Production Configuration](#production-configuration)
7. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Pre-Deployment Checklist

- [ ] All code is committed and merged to `main` branch
- [ ] Run `npm audit` and fix any critical vulnerabilities
- [ ] Run `npm run lint` and fix all linting errors
- [ ] Run `npm run type-check` and verify no TypeScript errors
- [ ] Run `npm run build` locally and verify successful build
- [ ] Test locally: `npm run start`
- [ ] All environment variables are set (see `.env.production`)
- [ ] Database backups are configured
- [ ] SSL certificate is ready (for production domain)
- [ ] CDN is configured (if applicable)
- [ ] Monitoring (Sentry) is configured

---

## Environment Setup

### 1. Generate Secrets

```bash
# Generate JWT Secret (32 bytes, base64 encoded)
openssl rand -base64 32

# Generate Payment Encryption Key (32 bytes, hex)
openssl rand -hex 32
```

### 2. Create Production Environment File

```bash
cp .env.production .env.production.local
# Edit .env.production.local with your production values
```

### 3. Required Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/m3allem"

# JWT (use generated secret above)
JWT_SECRET="your-secure-random-jwt-secret"

# App Configuration
APP_URL="https://m3allem.ma"
NODE_ENV="production"
LOG_LEVEL="info"

# CORS (restrict to production domain only)
CORS_ORIGIN="https://m3allem.ma"

# API Keys
GEMINI_API_KEY="your-gemini-key"
FIREBASE_API_KEY="your-firebase-key"
FIREBASE_PROJECT_ID="your-firebase-project"
FIREBASE_AUTH_DOMAIN="your-firebase-auth-domain"

# Payment Processing (use LIVE keys, not test keys)
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
PAYMENT_ENCRYPTION_KEY="your-hex-encryption-key"

# Communication Services
TWILIO_ACCOUNT_SID="your-twilio-sid"
TWILIO_AUTH_TOKEN="your-twilio-token"
TWILIO_PHONE_NUMBER="your-twilio-number"
TWILIO_WHATSAPP_NUMBER="your-twilio-whatsapp-number"

# Email Service
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Error Tracking
SENTRY_DSN="your-sentry-dsn"

# Database Credentials (for docker-compose)
POSTGRES_USER="m3allem"
POSTGRES_PASSWORD="your-secure-db-password"
POSTGRES_DB="m3allem"
```

### 4. Security Best Practices

- **Never commit `.env` files** - Only commit `.env.example`
- **Use environment variable injection** on your deployment platform
- **Rotate secrets regularly** (especially API keys and database passwords)
- **Use separate credentials** for development, staging, and production
- **Enable audit logging** for sensitive operations

---

## Database Migration

### 1. Local Testing

```bash
# Set DATABASE_URL to your test database
export DATABASE_URL="postgresql://user:password@localhost:5432/m3allem_test"

# Run migrations
npx prisma db push

# Seed test data
npx prisma db seed
```

### 2. Production Database

```bash
# Connect to production database
export DATABASE_URL="postgresql://user:password@prod-host:5432/m3allem"

# Create backup FIRST
pg_dump $DATABASE_URL > backup_$(date +%s).sql

# Run migrations (be careful!)
npx prisma db push

# Seed initial data (if needed)
npx prisma db seed
```

### 3. Backup Strategy

```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backups/m3allem_$DATE.sql"
pg_dump $DATABASE_URL -F c -b -v -f "$BACKUP_FILE"
# Upload to cloud storage
gsutil cp "$BACKUP_FILE" gs://your-backup-bucket/
```

---

## Docker Deployment

### 1. Build Docker Image

```bash
# Build locally
docker build -t m3allem:latest .

# Tag for registry
docker tag m3allem:latest gcr.io/your-project/m3allem:latest

# Push to Google Container Registry
docker push gcr.io/your-project/m3allem:latest
```

### 2. Docker Compose (Local Testing)

```bash
# Create .env file with production values
cp .env.production .env

# Start services
docker-compose up -d

# Check logs
docker-compose logs -f app

# Stop services
docker-compose down
```

### 3. Docker Health Checks

The image includes a health check endpoint:

```bash
# Test health check
curl http://localhost:3000/api/health
# Expected response:
# {"status":"ok","env":"production","dbReady":true}
```

---

## Cloud Run Deployment

### 1. Configure Cloud Run

```bash
# Set project
gcloud config set project your-project-id

# Deploy image
gcloud run deploy m3allem \
  --image gcr.io/your-project/m3allem:latest \
  --platform managed \
  --region us-central1 \
  --memory 2Gi \
  --cpu 2 \
  --timeout 3600 \
  --max-instances 100 \
  --min-instances 1 \
  --set-env-vars DATABASE_URL="$DATABASE_URL",JWT_SECRET="$JWT_SECRET",NODE_ENV="production"
```

### 2. Set Environment Variables in Cloud Run

Use Cloud Run secrets for sensitive values:

```bash
# Create secrets in Secret Manager
gcloud secrets create m3allem-jwt-secret --data-file=<(echo -n "$JWT_SECRET")
gcloud secrets create m3allem-db-url --data-file=<(echo -n "$DATABASE_URL")

# Grant Cloud Run permission to access secrets
gcloud run services add-iam-policy-binding m3allem \
  --member serviceAccount:cloud-run@your-project.iam.gserviceaccount.com \
  --role roles/secretmanager.secretAccessor
```

### 3. Configure Custom Domain

```bash
# Map custom domain to Cloud Run
gcloud run domain-mappings create --service=m3allem --domain=m3allem.ma
```

---

## Production Configuration

### 1. HTTPS/SSL

Cloud Run automatically provides HTTPS. For custom domains:

```bash
# Use Cloud Load Balancer with SSL certificate
gcloud compute ssl-certificates create m3allem-cert \
  --certificate path/to/cert.pem \
  --private-key path/to/key.pem
```

### 2. Security Headers (Helmet)

Already configured in `server/index.ts`:

```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
```

### 3. CORS Configuration

Restrict CORS to production domain only:

```env
CORS_ORIGIN="https://m3allem.ma"
```

### 4. Rate Limiting

Already configured in `server/index.ts`:

```typescript
// General API rate limit: 2000 requests per 15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2000,
  message: "Too many requests, please try again later",
});

// Auth rate limit: 100 requests per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many login attempts, please try again later",
});
```

### 5. Database Connection Pooling

For production, configure connection pooling:

```env
# PgBouncer or similar
DATABASE_URL="postgresql://user:password@pgbouncer-host:6432/m3allem"
```

### 6. Caching Strategy

#### Static Assets

- Cache-Control: `public, max-age=31536000` (1 year) for versioned assets
- Cache-Control: `public, max-age=3600` (1 hour) for HTML

#### API Responses

- Use Redis for frequently accessed data (languages, categories)
- Implement ETag for conditional requests

---

## Monitoring & Maintenance

### 1. Error Tracking (Sentry)

Already integrated. Verify configuration:

```env
SENTRY_DSN="your-sentry-dsn"
```

Monitor errors at: https://sentry.io/

### 2. Logging

Pino logging is configured:

```env
LOG_LEVEL="info"  # Options: debug, info, warn, error
```

View logs:

```bash
# Cloud Run logs
gcloud run services describe m3allem
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=m3allem"
```

### 3. Database Monitoring

```bash
# Check connection status
psql $DATABASE_URL -c "SELECT count(*) as connections FROM pg_stat_activity;"

# Monitor slow queries
psql $DATABASE_URL -c "SELECT query, calls, total_time FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;"
```

### 4. Performance Monitoring

- Use Cloud Monitoring for Cloud Run metrics
- Set up alerts for:
  - Request latency > 3000ms
  - Error rate > 1%
  - CPU > 80%
  - Memory > 80%

```bash
gcloud monitoring policies create \
  --notification-channels=your-channel \
  --display-name="M3allem High Latency" \
  --condition-display-name="Latency > 3s" \
  --condition-threshold-value=3000
```

### 5. Regular Maintenance

#### Weekly

- [ ] Review error logs in Sentry
- [ ] Check database size and growth
- [ ] Review slow query logs

#### Monthly

- [ ] Update dependencies: `npm update`
- [ ] Run security audit: `npm audit`
- [ ] Review performance metrics
- [ ] Test database backups

#### Quarterly

- [ ] Rotate secrets and API keys
- [ ] Review and update security policies
- [ ] Load test the application
- [ ] Review and optimize database queries

### 6. Incident Response

#### Database Connection Issues

```bash
# Check connection status
psql $DATABASE_URL -c "\conninfo"

# Restart connection pooling
sudo systemctl restart pgbouncer

# Check Prisma client
npx prisma db execute --stdin < "SELECT 1;"
```

#### High Memory Usage

```bash
# Check Node process memory
ps aux | grep node

# Restart Cloud Run service
gcloud run services update-traffic m3allem --to-revisions LATEST=100

# Roll back to previous version
gcloud run deploy m3allem --image gcr.io/your-project/m3allem:previous
```

#### Disk Space Issues

```bash
# Check storage
df -h

# Clear logs
gcloud logging delete-log projects/your-project/logs/LOGNAME

# Archive old data
# See backup strategy above
```

---

## Post-Deployment Verification

After deployment, verify everything works:

```bash
# 1. Check health endpoint
curl https://m3allem.ma/api/health

# 2. Test authentication
curl -X POST https://m3allem.ma/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'

# 3. Test marketplace API
curl https://m3allem.ma/api/marketplace/categories

# 4. Check security headers
curl -I https://m3allem.ma

# 5. Run performance test
# Use Lighthouse or WebPageTest
```

---

## Rollback Procedure

If deployment fails:

```bash
# List previous revisions
gcloud run revisions list --service=m3allem

# Rollback to previous version
gcloud run deploy m3allem \
  --image gcr.io/your-project/m3allem:previous-version
```

---

## Support & Troubleshooting

- **Error Logs**: Check Sentry at https://sentry.io/
- **Application Logs**: `gcloud logging read "resource.type=cloud_run_revision"`
- **Database Issues**: Connect directly to DB and run diagnostics
- **Network Issues**: Check Cloud Load Balancer configuration
- **Performance Issues**: Use Cloud Profiler and Cloud Trace

---

## Additional Resources

- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)
- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Node.js Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

---

**Last Updated**: 2026-05-17  
**Version**: 1.0.0
