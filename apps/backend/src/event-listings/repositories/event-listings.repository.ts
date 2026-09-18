import { type EventDto, type EventSortDto, type GetEventsQueryDto } from '@repo/schemas/events';

export type EventListingRecord = EventDto & {
  createdAt: Date;
  registrationsCount: number;
};

export type EventStats = {
  eventCount: number;
  locationCount: number;
  categoryCount: number;
};

export type PaginatedListings = {
  items: EventListingRecord[];
  total: number;
};

export function filterListings(
  records: EventListingRecord[],
  query: GetEventsQueryDto,
): PaginatedListings {
  const q = query.search?.trim().toLowerCase();
  const filtered = records.filter((record) => {
    if (query.categories?.length && !query.categories.some((c) => record.category.includes(c))) {
      return false;
    }
    if (q) {
      const hay = [record.title, record.location, record.address, ...record.category]
        .join(' ')
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
  const total = filtered.length;
  const start = (query.page - 1) * query.pageSize;
  return { items: filtered.slice(start, start + query.pageSize), total };
}

export abstract class EventListingsRepository {
  abstract findAll(sort: EventSortDto): Promise<EventListingRecord[]>;
  abstract findFeatured(): Promise<EventListingRecord[]>;
  abstract getStats(): Promise<EventStats>;
  abstract findRegisteredByUser(userId: string): Promise<EventListingRecord[]>;
}
