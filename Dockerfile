# ==========================================
# STAGE 1: Build Frontend SPA
# ==========================================
FROM node:20-alpine AS build-stage

WORKDIR /app

# Copy dependency lockfiles
COPY package.json package-lock.json ./

# Clean install dependencies
RUN npm ci

# Copy frontend source code
COPY . .

# Set build argument for production API endpoint (default: /api/v1 for reverse proxy)
ARG VITE_API_BASE_URL=/api/v1
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Build production bundle
RUN npm run build

# ==========================================
# STAGE 2: Nginx Static Production Server
# ==========================================
FROM nginx:alpine AS production-stage

# Remove default Nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy built frontend assets from stage 1
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose standard HTTP port
EXPOSE 80

# Launch Nginx in foreground mode
CMD ["nginx", "-g", "daemon off;"]
