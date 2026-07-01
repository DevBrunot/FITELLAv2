# Fitela — Frontend

App React conectado ao backend via API REST.

## Pré-requisitos
- Node.js 18+ (ou Docker)

## Instalação e execução

```bash
cd frontend
yarn install
yarn dev
```

Acesse http://localhost:5173

## Variáveis de ambiente (.env)

```env
VITE_API_BASE_URL=http://localhost:3000
```

## Docker

Na raiz do projeto:
```bash
docker compose -f docker-compose.frontend.yml up --build
```

> Suba o backend antes (`docker-compose.backend.yml`).

## Stack
- React 18 + TypeScript
- Vite 5
- Tailwind CSS
- TanStack Query v5
- React Hook Form + Zod
- React Router v6
- Axios
