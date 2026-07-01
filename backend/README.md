# FITELA — Backend API

API REST para app de treinamento de gestantes. NestJS + TypeORM + PostgreSQL.

## Stack
- NestJS 10+
- TypeORM + PostgreSQL (pg)
- Passport + JWT
- class-validator / class-transformer
- multer (upload local → trocar por S3/GCS)

## Setup

```bash
yarn install
```

## Variáveis de ambiente (.env)

```env
DATABASE_URL=postgres://user:password@localhost:5432/fitela
JWT_SECRET=seu_secret_aqui
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173
```

## Rodar em dev

```bash
yarn start:dev
```

Com `NODE_ENV=development`, o TypeORM usa `synchronize: true` (cria/atualiza tabelas automaticamente).

## Docker

Na raiz do projeto:
```bash
docker compose -f docker-compose.backend.yml up --build
```

## Testes

```bash
yarn test          # unitários (19 testes)
yarn test:e2e      # jornada completa e2e (15 testes)
yarn test:cov      # com cobertura
```

## Migrations (produção)

```bash
npx typeorm migration:generate -n NomeDaMigration -d src/data-source.ts
npx typeorm migration:run -d src/data-source.ts
```

> Em produção, defina `synchronize: false` no TypeORM config e use migrations.

## Rotas principais

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | /api/auth/register | Cadastro do personal trainer |
| POST | /api/auth/login | Login do personal trainer |
| POST | /api/auth/student/register | Cadastro da aluna (requer code) |
| POST | /api/auth/student/login | Login da aluna |
| GET | /api/exercises | Lista exercícios |
| POST | /api/exercises | Criar exercício |
| GET | /api/workouts | Lista treinos |
| POST | /api/workouts | Criar treino |
| POST | /api/workouts/:id/send | Enviar treino para aluna |
| POST | /api/workouts/:id/save-template | Salvar como template |
| GET | /api/students | Lista alunas |
| PATCH | /api/students/:id/approve | Aprovar aluna |
| PATCH | /api/students/:id/reject | Rejeitar aluna |
| GET | /api/registration-links | Links de registro |
| POST | /api/registration-links | Criar link |
| POST | /api/anamnesis | Aluna cria anamnese |
| GET | /api/anamnesis/me | Aluna busca sua anamnese |
| GET | /api/student/workouts | Treinos da aluna |
| POST | /api/student/workouts/:id/start | Iniciar treino |
| POST | /api/student/workouts/:id/finish | Finalizar treino |
| POST | /api/workouts/:id/feedback | Feedback do treino |
| POST | /api/upload | Upload de arquivo |
| GET | /api/dashboard/metrics | Métricas do personal |
| GET | /api/notifications | Notificações |
