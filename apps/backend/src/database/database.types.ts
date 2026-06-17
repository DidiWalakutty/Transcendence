import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@repo/schemas/database';

export type Database = NodePgDatabase<typeof schema>;
