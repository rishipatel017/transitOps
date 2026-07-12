import { defineConfig } from 'prisma/config';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

// Load .env file
dotenv.config();

const connectionString = process.env.DATABASE_URL!;

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: connectionString,
  },
});
