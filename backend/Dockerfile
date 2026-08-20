# ==========================================
# STAGE 1: Builder
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install OpenSSL for Prisma engine binary compatibility on Alpine Linux
RUN apk add --no-cache openssl

# Copy dependency lockfiles
COPY package.json package-lock.json ./

# Install all dependencies (including devDependencies for TypeScript compilation)
RUN npm ci

# Copy Prisma schema and migrations
COPY prisma ./prisma/

# Generate Prisma Client
RUN npx prisma generate

# Copy source code and TypeScript config
COPY tsconfig.json tsconfig.seed.json ./
COPY src ./src

# Build production dist JavaScript and seed runner
RUN npm run build && npx tsc -p tsconfig.seed.json

# ==========================================
# STAGE 2: Production Runtime
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Install OpenSSL in runtime stage for Prisma engine runtime
RUN apk add --no-cache openssl

# Copy dependency lockfiles
COPY package.json package-lock.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy generated Prisma Client artifact from builder
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy compiled JavaScript distribution
COPY --from=builder /app/dist ./dist

# Copy Prisma schema & migrations for production migration deployment
COPY --from=builder /app/prisma ./prisma

# Create upload directories for persistent storage
RUN mkdir -p uploads/resumes uploads/documents

# Expose backend API port
EXPOSE 5000

# Start compiled production server
CMD ["npm", "run", "start"]
