FROM node:lts-slim as builder

WORKDIR /app

# Copy only package files first
COPY package*.json ./

# Install dependencies with cache
RUN --mount=type=cache,id=npm-cache,target=/root/.npm \
    npm ci --cache-min 9999999

# Copy application code
COPY . .

# Build phase
RUN npm run build

# Production image
FROM node:lts-slim

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY package*.json ./

ENV NODE_ENV=production
ENV HOST=0.0.0.0

EXPOSE 4000

CMD ["node", "dist/index.js"]