# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:24-alpine AS build

WORKDIR /app

# Accept VITE_API_URL as a build argument (baked into the SPA bundle at build time)
ARG VITE_API_URL=http://localhost:3000
ENV VITE_API_URL=${VITE_API_URL}

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source files (node_modules excluded via .dockerignore)
COPY index.html ./
COPY public ./public/
COPY src ./src/
COPY tsconfig.json tsconfig.app.json tsconfig.node.json vite.config.ts ./
COPY components.json ./

# Build the application
RUN npm run build

# ─── Stage 2: Production (nginx) ──────────────────────────────────────────────
FROM nginx:alpine AS production

# Copy built SPA assets
COPY --from=build /app/dist /usr/share/nginx/html

# Override default nginx config with SPA-aware routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# nginx image already runs as non-root nginx user (uid 101)
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
