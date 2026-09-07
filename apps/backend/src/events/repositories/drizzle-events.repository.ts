// Handles saving and retrieving events from the database.
// Implements the EventRepository using Drizzle ORM.

import { Inject, Injectable } from '@nestjs/common';
import { events } from '@repo/schemas/database';
import type { EventDto, UpdateEventDto } from '@repo/schemas/events';
import { DATABASE } from '../../database/database.constants';
import type { Database } from '../../database/database.types';
import { EventsRepository, type CreateEventRecord } from './events.repository';
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
        dateTime: new Date(`${data.date}T${data.time}`),
        maxCapacity: data.maxCapacity,
        category: data.category,
      })
      .returning({ id: events.id });

    return event.id;
  }

  // Find a single event by its ID and return it as an EventDto.
  async findById(id: string): Promise<EventDto | null> {
    const [event] = await this.db.select().from(events).where(eq(events.id, id)).limit(1);

    if (!event) {
      return null;
    }

    const dateTime = event.dateTime.toISOString();

    return {
      id: event.id,
      organizerId: event.organizerId,
      title: event.title,
      category: event.category,
      location: event.location,
      address: event.address,
      date: dateTime.split('T')[0],
      time: dateTime.split('T')[1].slice(0, 5),
      maxCapacity: event.maxCapacity,
      image: event.image,
      description: event.description.en ?? '',
    };
  }

  // Find every event a user organizes, soonest first.
  async findByOrganizer(organizerId: string): Promise<EventDto[]> {
    const organizerEvents = await this.db
      .select()
      .from(events)
      .where(eq(events.organizerId, organizerId))
      .orderBy(asc(events.dateTime));

    return organizerEvents.map((event) => this.toDto(event));
  }

  async update({ id, date, time, description, ...data }: UpdateEventDto): Promise<EventDto | null> {
    const [event] = await this.db
      .update(events)
      .set({
        ...data,
        description: { en: description },
        dateTime: new Date(`${date}T${time}`),
      })
      .where(eq(events.id, id))
      .returning();

    return event ? this.toDto(event) : null;
  }

  async delete(id: string): Promise<EventDto | null> {
    const [event] = await this.db.delete(events).where(eq(events.id, id)).returning();

    return event ? this.toDto(event) : null;
  }

  private toDto(event: typeof events.$inferSelect): EventDto {
    const dateTime = event.dateTime.toISOString();

    return {
      id: event.id,
      organizerId: event.organizerId,
      title: event.title,
      category: event.category,
      location: event.location,
      address: event.address,
      date: dateTime.slice(0, 10),
      time: dateTime.slice(11, 16),
      maxCapacity: event.maxCapacity,
      image: event.image,
      description: event.description.en ?? '',
    };
  }
}
