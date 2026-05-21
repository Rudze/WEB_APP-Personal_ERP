FROM node:20-alpine
WORKDIR /app

# OpenSSL requis par le query engine Prisma sur Alpine
RUN apk add --no-cache openssl

# Installer toutes les dépendances (prisma CLI inclus)
COPY package*.json ./
RUN npm install

# Générer le client Prisma (a besoin du schema)
COPY prisma ./prisma
RUN npx prisma generate

# Copier le source
COPY src ./src
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

EXPOSE 4000
ENTRYPOINT ["sh", "docker-entrypoint.sh"]
