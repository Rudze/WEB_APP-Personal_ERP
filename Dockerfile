# ── Stage 1: Build frontend ────────────────────────────────────────────────
FROM node:20-alpine AS frontend-build
WORKDIR /build
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# ── Stage 2: Backend + static frontend ────────────────────────────────────
FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache openssl

COPY backend/package*.json ./
RUN npm install

COPY backend/prisma ./prisma
RUN npx prisma generate

COPY backend/src ./src
COPY backend/docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

COPY --from=frontend-build /build/dist ./public

EXPOSE 4000
ENTRYPOINT ["sh", "docker-entrypoint.sh"]
