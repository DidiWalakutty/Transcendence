import { Inject, Injectable } from '@nestjs/common';
import { asc, desc, eq, sql } from 'drizzle-orm';

import { events, registrations } from '@repo/schemas/database';
import { type EventSortDto } from '@repo/schemas/events';

import { DATABASE } from '../../database/database.constants';
import type { Database } from '../../database/database.types';
import { type EventListingRecord, EventListingsRepository } from './event-listings.repository';

@Injectable()
export class DrizzleEventListingsRepository extends EventListingsRepository {
  constructor(
    @Inject(DATABASE)
    private readonly db: Database,
  ) {
    super();
  }

  async findAll(sort: EventSortDto): Promise<EventListingRecord[]> {
    const registrationCount = sql<number>`count(${registrations.eventId})`;

    const rows = await this.db
      .select({
        id: events.id,
        title: events.title,
        createdAt: events.createdAt,
        description: events.description,
        image: events.image,
        location: events.location,
        dateTime: events.dateTime,
        category: events.category,
        registrationsCount: sql<number>`count(${registrations.eventId})`,
      })
      .from(events)
      .leftJoin(registrations, eq(registrations.eventId, events.id))
      .groupBy(events.id)
      .orderBy(
        sort === 'popular'
          ? desc(registrationCount)
          : sort === 'newest'
            ? desc(events.createdAt)
            : asc(events.dateTime),
        asc(events.createdAt),
      );

    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      category: row.category,
      location: row.location,
      date: row.dateTime.toISOString().slice(0, 10),
      image: row.image,
      description: Object.values(row.description).find((value) => value.length > 0) ?? '',
      createdAt: row.createdAt,
      registrationsCount: Number(row.registrationsCount),
    }));
  }
  async findFeatured(): Promise<EventListingRecord[]> {
    const registrationCount = sql<number>`count(${registrations.eventId})`;

    const rows = await this.db
      .select({
        id: events.id,
        title: events.title,
        createdAt: events.createdAt,
        description: events.description,
        image: events.image,
        location: events.location,
        dateTime: events.dateTime,
        category: events.category,
        registrationsCount: registrationCount,
      })
      .from(events)
      .leftJoin(registrations, eq(registrations.eventId, events.id))
      .groupBy(events.id)
      .orderBy(asc(events.dateTime))
      .limit(4);

    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      category: row.category,
      location: row.location,
      date: row.dateTime.toISOString().slice(0, 10),
      image: row.image,
      description: Object.values(row.description).find((value) => value.length > 0) ?? '',
      createdAt: row.createdAt,
      registrationsCount: Number(row.registrationsCount),
    }));
  }
}
