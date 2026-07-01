# FITELA

Monorepo com backend (NestJS) e frontend (React) separados, conectados via API REST.

## Estrutura

```
fitela/
├── backend/          # API NestJS + TypeORM + PostgreSQL
├── frontend/         # App React + Vite + Tailwind
├── docker-compose.backend.yml
├── docker-compose.frontend.yml
└── docker-compose.yml
```

## Docker (recomendado)

**Backend + banco:**
```bash
docker compose -f docker-compose.backend.yml up --build
```

**Frontend:**
```bash
docker compose -f docker-compose.frontend.yml up --build
```

**Tudo junto:**
```bash
docker compose up --build
```

> Usa **Yarn** dentro dos containers (mais rápido que npm).

| Serviço  | URL |
|----------|-----|
| Frontend | http://localhost:5173 |
| Backend  | http://localhost:3000/api |
| Postgres | localhost:5432 (user/senha/db: `fitela`) |

## Desenvolvimento local (sem Docker)

**Backend** (`backend/`):
```bash
cd backend
yarn install
yarn start:dev
```

**Frontend** (`frontend/`):
```bash
cd frontend
yarn install
yarn dev
```

O frontend chama o backend via `VITE_API_BASE_URL` (padrão: `http://localhost:3000`).

## Documentação

- [Backend](./backend/README.md)
- [Frontend](./frontend/README.md)
