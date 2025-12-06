# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Stage 2: Build Backend
FROM node:20-alpine AS backend-builder

WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
RUN npm ci
COPY server/ ./server/
COPY shared/ ./shared/
RUN npm run build

# Stage 3: Production Image
FROM node:20-alpine AS production

# Install dependencies for sharp (image processing)
RUN apk add --no-cache \
    vips-dev \
    fftw-dev \
    build-base \
    python3

WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built backend
COPY --from=backend-builder /app/dist ./dist
COPY --from=backend-builder /app/shared ./shared

# Copy built frontend
COPY --from=frontend-builder /app/client/dist ./dist/client

# Create uploads directory
RUN mkdir -p /app/uploads

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

# Start the application
CMD ["node", "dist/server/index.js"]
