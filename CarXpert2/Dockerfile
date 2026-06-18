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
COPY server/ ./server/
COPY shared/ ./shared/
RUN npm ci
RUN npm run build
RUN npm prune --omit=dev

# Stage 3: Production Image
FROM node:20-alpine AS production

WORKDIR /app

# Copy runtime dependencies from builder (avoids rebuilding sharp in production stage)
COPY --from=backend-builder /app/node_modules ./node_modules
COPY --from=backend-builder /app/package*.json ./

# Copy built backend
COPY --from=backend-builder /app/dist ./dist
COPY --from=backend-builder /app/shared ./shared

# Copy built frontend
COPY --from=frontend-builder /app/dist/client ./dist/client

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
