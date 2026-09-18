// Defines how the operations are implemented using Drizzle ORM.
// Handles database operations for event registrations using Drizzle ORM.
// It checks ticket availability, finds a user's active registration,
// creates new registrations when users buy tickets, and cancels registrations
// when users give up their tickets.

import { Inject, Injectable } from '@nestjs/common';
import { and, eq, inArray, sql } from 'drizzle-orm';

import { events, registrations, users } from '@repo/schemas/database';
import type { registration } from '@repo/schemas/database';
import type { EventAttendeeDto } from '@repo/schemas/registrations';

import { DATABASE } from '../../database/database.constants';
import type { Database } from '../../database/database.types';

import { RegistrationsRepository, type RegisterResult } from './registrations.repository';
import {
  activeRegistrationCountSql,
  activeRegistrationWhere,
  isActiveRegistration,
} from '../registration.conditions';

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
        registeredCount: activeRegistrationCountSql,
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
      .where(activeRegistrationWhere(eventId, userId))
      .limit(1);
    return registration ?? null;
  }

  // Registers a user for an event while preventing overbooking/race conditions.
  async register(eventId: string, userId: string): Promise<RegisterResult> {
    return this.db.transaction(async (tx) => {
      const [event] = await tx
        .select({
          maxCapacity: events.maxCapacity,
        })
        .from(events)
        .where(eq(events.id, eventId))
        .for('update');

      if (!event) {
        return { type: 'event-not-found' };
      }

      const [existingRegistration] = await tx
        .select()
        .from(registrations)
        .where(activeRegistrationWhere(eventId, userId))
        .limit(1);

      if (existingRegistration) {
        return { type: 'already-registered' };
      }

      const [{ registeredCount }] = await tx
        .select({
          registeredCount: activeRegistrationCountSql,
        })
        .from(registrations)
        .where(eq(registrations.eventId, eventId));

      if (Number(registeredCount) >= event.maxCapacity) {
        return { type: 'sold-out' };
      }

      const [newRegistration] = await tx
        .insert(registrations)
        .values({
          eventId,
          userId,
          status: 'active',
        })
        .returning();

      return {
        type: 'success',
        registration: newRegistration,
      };
    });
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

  // Marks an active registration as canceled, making the ticket available again.
  async cancel(eventId: string, userId: string): Promise<registration | null> {
    const [registration] = await this.db
      .update(registrations)
      .set({
        status: 'canceled',
      })
      .where(activeRegistrationWhere(eventId, userId))
      .returning();
    return registration ?? null;
  }

  // Retrieves a list of users who have active registrations for an event.
  async getEventAttendees(eventId: string): Promise<EventAttendeeDto[]> {
    return this.db
      .select({
        id: users.id,
        name: users.name,
        username: users.username,
      })
      .from(registrations)
      .innerJoin(users, eq(registrations.userId, users.id))
      .where(and(eq(registrations.eventId, eventId), isActiveRegistration));
  }

  async getAttendeeCounts(eventIds: string[]) {
    if (eventIds.length === 0) return [];
    const rows = await this.db
      .select({
        eventId: registrations.eventId,
        count: sql<number>`count(*)`,
      })
      .from(registrations)
      .where(and(inArray(registrations.eventId, eventIds), isActiveRegistration))
      .groupBy(registrations.eventId);
    const byId = new Map(rows.map((r) => [r.eventId, Number(r.count)]));
    return eventIds.map((eventId) => ({ eventId, count: byId.get(eventId) ?? 0 }));
  }

  // Checks if a user is the organizer of an event.
  async isEventOrganizer(eventId: string, userId: string): Promise<boolean> {
    const [event] = await this.db
      .select({ id: events.id })
      .from(events)
      .where(and(eq(events.id, eventId), eq(events.organizerId, userId)))
      .limit(1);
    return !!event;
  }
}
