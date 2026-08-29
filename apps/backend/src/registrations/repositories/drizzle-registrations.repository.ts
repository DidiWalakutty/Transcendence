// Defines how the operations are implemented using Drizzle ORM.
// Handles database operations for event registrations using Drizzle ORM.
// It checks ticket availability, finds a user's active registration,
// creates new registrations when users buy tickets, and cancels registrations
// when users give up their tickets.

import { Inject, Injectable } from '@nestjs/common';
import { and, eq, sql } from 'drizzle-orm';

import { events, registrations } from '@repo/schemas/database';
import type { registration } from '@repo/schemas/database';

import { DATABASE } from '../../database/database.constants';
import type { Database } from '../../database/database.types';

import { RegistrationsRepository } from './registrations.repository';

@Injectable()
export class DrizzleRegistrationsRepository extends RegistrationsRepository {
  constructor(
    @Inject(DATABASE)
    private readonly db: Database,
  ) {
    super();
  }

  // Calculates the number of tickets still available for an event.
  async getAvailableTickets(eventId: string): Promise<number> {
    const [result] = await this.db
      .select({
        maxCapacity: events.maxCapacity,
        registeredCount: sql<number>`
          count(*) filter (
            where ${registrations.status} = 'active'
          )
        `,
      })
      .from(events)
      .leftJoin(registrations, eq(registrations.eventId, events.id))
      .where(eq(events.id, eventId))
      .groupBy(events.id);

    if (!result) {
      throw new Error('Event not found');
    }

    return result.maxCapacity - Number(result.registeredCount);
  }

  // Finds whether a user already has an active registration for an event.
  async findActiveRegistration(eventId: string, userId: string): Promise<registration | null> {
    const [registration] = await this.db
      .select()
      .from(registrations)
      .where(
        and(
          eq(registrations.eventId, eventId),
          eq(registrations.userId, userId),
          eq(registrations.status, 'active'),
        ),
      )
      .limit(1);
    return registration ?? null;
  }

  // Creates a new active registration for a user and event.
  async create(eventId: string, userId: string): Promise<registration> {
    const [registration] = await this.db
      .insert(registrations)
      .values({
        eventId,
        userId,
        status: 'active',
      })
      .returning();
    return registration;
  }

  // Changes an active registration to canceled so the ticket becomes available again.
  async cancel(eventId: string, userId: string): Promise<registration | null> {
    const [registration] = await this.db
      .update(registrations)
      .set({
        status: 'canceled',
      })
      .where(
        and(
          eq(registrations.eventId, eventId),
          eq(registrations.userId, userId),
          eq(registrations.status, 'active'),
        ),
      )
      .returning();
    return registration ?? null;
  }
}
