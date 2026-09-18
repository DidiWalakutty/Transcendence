import { Inject, Injectable } from '@nestjs/common';
import { asc, desc, eq, sql, and } from 'drizzle-orm';

import { events, registrations } from '@repo/schemas/database';
import { fromEventDateTime, type EventSortDto } from '@repo/schemas/events';
import { extractDescription } from '../../events/event.mapper';
import { isActiveRegistration } from '../../registrations/registration.conditions';

import { DATABASE } from '../../database/database.constants';
import type { Database } from '../../database/database.types';
import {
  type EventListingRecord,
  type EventStats,
  EventListingsRepository,
} from './event-listings.repository';

const EVENT_LISTING_COLUMNS = {
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
} as const;

const REGISTRATION_COUNT = sql<number>`count(${registrations.eventId})`;

async function getCategoryCount(db: Database): Promise<number> {
  const categoryCountResult = await db.execute(sql`
		SELECT COUNT(DISTINCT category) AS count
		FROM (
		SELECT unnest(category) AS category
		FROM events
		) AS categories
	`);
  return Number(categoryCountResult.rows[0]?.count ?? 0);
}

@Injectable()
export class DrizzleEventListingsRepository extends EventListingsRepository {
  constructor(
    @Inject(DATABASE)
    private readonly db: Database,
  ) {
    super();
  }

  private baseListingQuery() {
    return this.db
      .select({ ...EVENT_LISTING_COLUMNS, registrationsCount: REGISTRATION_COUNT })
      .from(events)
      .leftJoin(registrations, eq(registrations.eventId, events.id))
      .groupBy(events.id);
  }

  async findAll(sort: EventSortDto): Promise<EventListingRecord[]> {
    const rows = await this.baseListingQuery().orderBy(
      sort === 'popular'
        ? desc(REGISTRATION_COUNT)
        : sort === 'newest'
          ? desc(events.createdAt)
          : asc(events.dateTime),
      asc(events.createdAt),
    );

    return rows.map((row) => this.toRecord(row));
  }
  async findFeatured(): Promise<EventListingRecord[]> {
    const rows = await this.baseListingQuery().orderBy(asc(events.dateTime)).limit(8);

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

    const categoryCount = await getCategoryCount(this.db);

    return {
      eventCount: Number(eventCountResult.count),
      locationCount: Number(locationCountResult.count),
      categoryCount,
    };
  }

  async findRegisteredByUser(userId: string): Promise<EventListingRecord[]> {
    const rows = await this.db
      .select(EVENT_LISTING_COLUMNS)
      .from(registrations)
      .innerJoin(events, eq(registrations.eventId, events.id))
      .where(and(eq(registrations.userId, userId), isActiveRegistration))
      .orderBy(asc(events.dateTime));

    return rows.map((row) => this.toRecord({ ...row, registrationsCount: 0 }));
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
      description: extractDescription(row.description),
      createdAt: row.createdAt,
      registrationsCount: Number(row.registrationsCount),
    };
  }
}
