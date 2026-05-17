# Frontend Stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production Stage
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/server.ts ./server.ts

# Generate Prisma Client
RUN npx prisma generate

ENV NODE_ENV=production
EXPOSE 3000

# Start command (using the bundled server.cjs if following the build script guidelines)
# But for typical express+vite setup we use tsx or node server.cjs
CMD ["npm", "start"]
