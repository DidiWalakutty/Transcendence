import { Inject, Injectable } from '@nestjs/common';
import { asc, desc, eq, sql } from 'drizzle-orm';

import { events, registrations } from '@repo/schemas/database';
import { fromEventDateTime, type EventSortDto } from '@repo/schemas/events';

import { DATABASE } from '../../database/database.constants';
import type { Database } from '../../database/database.types';
import {
  type EventListingRecord,
  type EventStats,
  EventListingsRepository,
} from './event-listings.repository';

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
        organizerId: events.organizerId,
        createdAt: events.createdAt,
        description: events.description,
        image: events.image,
        location: events.location,
        address: events.address,
        dateTime: events.dateTime,
        maxCapacity: events.maxCapacity,
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

    return rows.map((row) => this.toRecord(row));
  }
  async findFeatured(): Promise<EventListingRecord[]> {
    const registrationCount = sql<number>`count(${registrations.eventId})`;

    const rows = await this.db
      .select({
        id: events.id,
        title: events.title,
        organizerId: events.organizerId,
        createdAt: events.createdAt,
        description: events.description,
        image: events.image,
        location: events.location,
        address: events.address,
        dateTime: events.dateTime,
        maxCapacity: events.maxCapacity,
        category: events.category,
        registrationsCount: registrationCount,
      })
      .from(events)
      .leftJoin(registrations, eq(registrations.eventId, events.id))
      .groupBy(events.id)
      .orderBy(asc(events.dateTime))
      .limit(4);

    return rows.map((row) => this.toRecord(row));
  }
  async getStats(): Promise<EventStats> {
    const [eventCountResult] = await this.db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(events);

    const [locationCountResult] = await this.db
      .select({
        count: sql<number>`count(distinct ${events.location})`,
      })
      .from(events);

    const categoryCountResult = await this.db.execute(sql`
		SELECT COUNT(DISTINCT category) AS count
		FROM (
		SELECT unnest(category) AS category
		FROM events
		) AS categories
	`);

    return {
      eventCount: Number(eventCountResult.count),
      locationCount: Number(locationCountResult.count),
      categoryCount: Number(categoryCountResult.rows[0]?.count ?? 0),
    };
  }

  private toRecord(row: {
    id: string;
    organizerId: string;
    title: string;
    category: string[];
    location: string;
    address: string;
    dateTime: Date;
    maxCapacity: number;
    image: string;
    description: Record<string, string>;
    createdAt: Date;
    registrationsCount: number;
  }): EventListingRecord {
    return {
      id: row.id,
      organizerId: row.organizerId,
      title: row.title,
      category: row.category,
      location: row.location,
      address: row.address,
      ...fromEventDateTime(row.dateTime),
      maxCapacity: row.maxCapacity,
      image: row.image,
      description: Object.values(row.description).find((value) => value.length > 0) ?? '',
      createdAt: row.createdAt,
      registrationsCount: Number(row.registrationsCount),
    };
  }
}
