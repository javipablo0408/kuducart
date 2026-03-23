#!/usr/bin/env bash
set -euo pipefail

echo "==> Levantando Postgres y Redis con Docker..."
docker compose up -d postgres redis

echo "==> Instalando dependencias del backend Medusa..."
npm --prefix backend install

echo "==> Ejecutando migraciones..."
npx --prefix backend medusa db:migrate

echo "==> Cargando datos demo y llaves publishable..."
npm --prefix backend run seed

echo "==> Arrancando backend Medusa (puerto 9000)..."
npm --prefix backend run dev
