# Production Dockerfile for Fawzy AI (Full-Stack Express + React/Vite)
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package.json ./
RUN npm install

# Copy application source
COPY . .

# Build the frontend and backend bundle into /app/dist
RUN npm run build

# Production runtime stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy package configuration and install production-only dependencies
COPY package.json ./
RUN npm install --omit=dev

# Copy compiled build output
COPY --from=builder /app/dist ./dist

EXPOSE 3000

# Start compiled server
CMD ["node", "dist/server.cjs"]
