# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:24-alpine AS build

WORKDIR /app

# Install all dependencies (including dev — needed for tsc and prisma)
COPY package.json package-lock.json ./
RUN npm ci

# Copy Prisma schema and config
COPY prisma ./prisma/
COPY prisma.config.ts ./

# Copy TypeScript source
COPY src ./src/
COPY tsconfig.json ./

# Build (runs prisma generate + tsc)
RUN npm run build

# Copy generated Prisma client to dist (tsc does not copy .js/.json/.wasm files from src)
RUN cp -r src/generated dist/generated

# ─── Stage 2: Production ──────────────────────────────────────────────────────
FROM node:24-alpine AS production

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001 -G nodejs

# Copy package manifest and install production dependencies only
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy compiled application from build stage
COPY --from=build /app/dist ./dist/

# Copy Prisma schema (needed for migrate deploy at runtime if required)
COPY --from=build /app/prisma ./prisma/

USER nodejs

EXPOSE 3000

ENV NODE_ENV=production

CMD ["node", "dist/server.js"]
