import { and, eq, sql } from 'drizzle-orm';
import { registrations } from '@repo/schemas/database';

export const isActiveRegistration = eq(registrations.status, 'active');

export function activeRegistrationWhere(eventId: string, userId: string) {
  return and(
    eq(registrations.eventId, eventId),
    eq(registrations.userId, userId),
    isActiveRegistration,
  );
}

export const activeRegistrationCountSql = sql<number>`count(*) filter (where ${registrations.status} = 'active')`;
