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

## Deploy no Render

O projeto inclui [`render.yaml`](./render.yaml) (Blueprint) com **API** + **frontend estático** + banco **Neon** (externo).

### Passo a passo

1. Faça push do código para o GitHub (`DevBrunot/FITELLAv2`).
2. No [Render](https://render.com): **New → Blueprint** → conecte o repositório.
3. Antes de aplicar, configure no painel:
   - **`DATABASE_URL`** — connection string do Neon (com `?sslmode=require`)
   - **`JWT_SECRET`** — pode usar o valor gerado pelo Render ou definir o seu
4. Aplique o Blueprint. Serão criados:
   - `fitela-api` — Web Service (NestJS)
   - `fitela-web` — Static Site (React/Vite)
5. Aguarde os dois deploys. URLs típicas:
   - API: `https://fitela-api.onrender.com`
   - App: `https://fitela-web.onrender.com`

### Variáveis importantes

| Serviço | Variável | Descrição |
|---------|----------|-----------|
| API | `DATABASE_URL` | Neon PostgreSQL |
| API | `JWT_SECRET` | Segredo do JWT |
| API | `DB_SYNC` | `true` no **1º deploy** (cria tabelas no Neon); depois remova ou `false` |
| API | `FRONTEND_URL` | Preenchido automaticamente pelo Blueprint (host do `fitela-web`) |
| Web | `VITE_API_BASE_URL` | Preenchido automaticamente (host do `fitela-api`) |

### Observações

- Plano **free** do Render: a API “dorme” após inatividade (~50s na 1ª requisição).
- Uploads de vídeo ficam no disco efêmero do Render — para produção, use S3 (futuro).
- Após o 1º deploy com tabelas criadas, desative `DB_SYNC` para evitar alterações automáticas no schema.

## Documentação

- [Backend](./backend/README.md)
- [Frontend](./frontend/README.md)
