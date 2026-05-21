#!/bin/sh
set -e

echo "► Applying Prisma migrations..."
npx prisma migrate deploy

# Seed uniquement si la table User est vide (premier démarrage)
USER_COUNT=$(node -e "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.user.count().then(n => { console.log(n); p.\$disconnect(); });
" 2>/dev/null || echo "0")

if [ "$USER_COUNT" = "0" ]; then
  echo "► Empty database — running seed..."
  node prisma/seed.js
fi

echo "► Starting server..."
exec node src/index.js
