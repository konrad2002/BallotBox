#!/bin/sh
set -e

# Ensure local node bin is on PATH
export PATH="/app/node_modules/.bin:$PATH"

echo "[entrypoint] DATABASE_URL=$DATABASE_URL"
echo "[entrypoint] Applying Prisma migrations (deploy)..."
prisma migrate deploy

echo "[entrypoint] Starting Next.js server"
exec node server.js
