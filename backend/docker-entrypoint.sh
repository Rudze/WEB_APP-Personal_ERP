#!/bin/sh
set -e

echo "► Waiting for database..."
until node -e "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.\$connect().then(() => { p.\$disconnect(); process.exit(0); }).catch(() => { p.\$disconnect(); process.exit(1); });
" 2>/dev/null; do
  echo "  Not ready, retrying in 3s..."
  sleep 3
done

echo "► Applying Prisma schema (db push)..."
npx prisma db push --accept-data-loss

# Seed uniquement si la table User est vide (premier démarrage)
USER_COUNT=$(node -e "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.user.count().then(n => { console.log(n); p.\$disconnect(); });
" 2>/dev/null || echo "0")

if [ "$USER_COUNT" = "0" ]; then
  echo "► Empty database — running seed (admin@erp.local / Admin1234!)..."
  node prisma/seed.js
fi

echo "► Starting server..."
exec node src/index.js
