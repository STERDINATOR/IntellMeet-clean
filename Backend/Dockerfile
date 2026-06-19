# Production-ready backend Dockerfile
# Builds and runs the Express/Socket.IO API from Backend/src

FROM node:20-alpine

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source
COPY tsconfig.json ./
COPY src ./src

# Build TypeScript
RUN npm run build

# Runtime env
ENV NODE_ENV=production

EXPOSE 4000

# Start server
CMD ["node", "dist/server.js"]

