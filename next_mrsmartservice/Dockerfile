# --- Build stage
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- Runtime stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

# Install only production deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy build artifacts
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.* ./
COPY --from=builder /app/package.json ./

EXPOSE 8080

CMD ["sh", "-c", "npm run start -- -p ${PORT} -H 0.0.0.0"]
