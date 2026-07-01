// file: src/data-source.ts
// Usado pelo TypeORM CLI para gerar e rodar migrations.
// Exemplo: npx typeorm migration:generate -n Init -d src/data-source.ts
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { getDatabaseSsl } from './config/database';

const url = process.env.DATABASE_URL;

export default new DataSource({
  type: 'postgres',
  url,
  ssl: getDatabaseSsl(url),
  entities: ['src/entities/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
});
