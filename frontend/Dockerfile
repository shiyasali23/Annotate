# Dependencies stage
FROM node:18-alpine AS deps
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies with specific cache mount for npm
RUN --mount=type=cache,target=/root/.npm \
    npm ci

# Builder stage
FROM node:18-alpine AS builder
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max_old_space_size=4096"

# Copy dependencies and source code
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Runner stage - final, lightweight production image
FROM node:18-alpine AS runner
WORKDIR /app

# Set environment for production
ENV NODE_ENV=production

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy only necessary files from the builder stage
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Set correct permissions
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose the port
EXPOSE 3000

# Define the startup command
CMD ["npm", "start"]