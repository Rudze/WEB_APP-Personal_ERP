FROM node:20-alpine
WORKDIR /app

# Installer toutes les dépendances (prisma CLI inclus)
COPY package*.json ./
RUN npm ci

# Générer le client Prisma (a besoin du schema)
COPY prisma ./prisma
RUN npx prisma generate

# Copier le source
COPY src ./src
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

EXPOSE 4000
ENTRYPOINT ["sh", "docker-entrypoint.sh"]
