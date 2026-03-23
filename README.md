# Kudu Cart (Frontend + Medusa Backend)

Proyecto headless ecommerce con:

- `frontend`: Next.js App Router + Tailwind CSS
- `backend`: Medusa v2
- `infra local`: PostgreSQL + Redis vía Docker Compose

## Estructura

- `app`, `components`, `services`, `hooks`, `types`: frontend
- `backend`: API Medusa
- `docker-compose.yml`: Postgres + Redis
- `scripts/setup-medusa.sh`: bootstrap rápido del backend

## 1) Levantar base de datos local

```bash
npm run db:up
```

Esto crea:

- Postgres en `localhost:5433` (db/user/pass: `medusa`)
- Redis en `localhost:6379`

## 2) Levantar Medusa backend

```bash
npm run setup:medusa
```

El script ejecuta:

1. `docker compose up -d postgres redis`
2. `npm --prefix backend install`
3. `medusa db:migrate`
4. `npm --prefix backend run seed`
5. `npm --prefix backend run dev`

Backend quedará en `http://localhost:9000`.

## 3) Configurar frontend

Crea `.env.local` en la raíz:

```bash
NEXT_PUBLIC_MEDUSA_URL=http://localhost:9000
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_xxxxx
NEXT_PUBLIC_MEDUSA_REGION_ID=reg_xxxxx
NEXT_PUBLIC_MEDUSA_PAYMENT_PROVIDER_ID=pp_system_default
```

`pk_xxxxx` y `reg_xxxxx` los obtienes desde el Admin/API de Medusa luego del seed.

## 3.1) Stripe (opcional)

En `backend/.env`:

```bash
STRIPE_API_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

Si habilitas Stripe, en frontend usa:

```bash
NEXT_PUBLIC_MEDUSA_PAYMENT_PROVIDER_ID=pp_stripe_stripe
```

Luego reinicia backend y frontend.

## 4) Levantar frontend

```bash
npm install
npm run dev
```

Frontend: `http://localhost:3000`

## Scripts útiles

- `npm run dev:frontend`: arranca Next.js
- `npm run dev:backend`: arranca Medusa
- `npm run medusa:migrate`: corre migraciones
- `npm run medusa:seed`: carga datos demo
- `npm run db:down`: apaga Postgres/Redis

## Estado funcional actual

- Home con productos desde Medusa (SSR)
- Detalle de producto dinámico con metadata
- Carrito persistente en `localStorage` + operaciones Medusa
- Vista de carrito (actualizar/eliminar ítems)
- Registro/Login de cliente con Medusa Auth (`emailpass`)
- Portal de cliente en `/account` con perfil y pedidos

## Docker (producción VPS/Plesk)

Archivos nuevos:

- `Dockerfile.frontend`
- `backend/Dockerfile`
- `docker-compose.prod.yml`
- `.env.docker.example`

### 1) Preparar variables

```bash
cp .env.docker.example .env.docker
```

Edita `.env.docker` con tus dominios/keys reales.

### 2) Build + up

```bash
docker compose --env-file .env.docker -f docker-compose.prod.yml up -d --build
```

### 3) Ver logs

```bash
docker compose --env-file .env.docker -f docker-compose.prod.yml logs -f
```

### 4) Reinicio rápido

```bash
docker compose --env-file .env.docker -f docker-compose.prod.yml up -d
```

### 5) Scripts npm (alternativa)

```bash
npm run docker:prod:up
npm run docker:prod:logs
npm run docker:prod:down
```
