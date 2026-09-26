// Handles saving and retrieving events from the database.
// Implements the EventRepository using Drizzle ORM.

import { Inject, Injectable } from '@nestjs/common';
import { events } from '@repo/schemas/database';
import { toEventDateTime, type EventDto, type UpdateEventDto } from '@repo/schemas/events';
import { DATABASE } from '../../database/database.constants';
import type { Database } from '../../database/database.types';
import { EventsRepository, type CreateEventRecord } from './events.repository';
import { toEventDto } from '../event.mapper';
import { asc, eq } from 'drizzle-orm';

@Injectable()
export class DrizzleEventsRepository extends EventsRepository {
  constructor(
    @Inject(DATABASE)
    private readonly db: Database,
  ) {
    super();
  }

  // Insert the new event into the database
  async create(data: CreateEventRecord): Promise<string> {
    const [event] = await this.db
      .insert(events)
      .values({
        title: data.title,
        // Store the description in the translation-ready JSON format.
        // for now: the description is stored in English only, but this can be extended to support multiple languages in the future.
        description: { en: data.description },
        image: data.image,
        organizerId: data.organizerId,
        location: data.location,
        address: data.address,
        dateTime: toEventDateTime(data.date, data.time),
        maxCapacity: data.maxCapacity,
        category: data.category,
        contactName: data.contactName,
        contactEmail: data.contactEmail,
      })
      .returning({ id: events.id });

    return event.id;
  }

  // Find a single event by its ID and return it as an EventDto.
  async findById(id: string): Promise<EventDto | null> {
    const [event] = await this.db.select().from(events).where(eq(events.id, id)).limit(1);

    return event ? toEventDto(event) : null;
  }

  // Find all events, soonest first.
  async findAll(): Promise<EventDto[]> {
    const allEvents = await this.db.select().from(events).orderBy(asc(events.dateTime));

    return allEvents.map((event) => toEventDto(event));
  }

  // Find every event a user organizes, soonest first.
  async findByOrganizer(organizerId: string): Promise<EventDto[]> {
    const organizerEvents = await this.db
      .select()
      .from(events)
      .where(eq(events.organizerId, organizerId))
      .orderBy(asc(events.dateTime));

    return organizerEvents.map((event) => toEventDto(event));
  }

  async update({ id, date, time, description, ...data }: UpdateEventDto): Promise<EventDto | null> {
    const [event] = await this.db
      .update(events)
      .set({
        ...data,
        description: { en: description },
        dateTime: toEventDateTime(date, time),
      })
      .where(eq(events.id, id))
      .returning();

    return event ? toEventDto(event) : null;
  }

  async delete(id: string): Promise<EventDto | null> {
    const [event] = await this.db.delete(events).where(eq(events.id, id)).returning();

    return event ? toEventDto(event) : null;
  }
}
