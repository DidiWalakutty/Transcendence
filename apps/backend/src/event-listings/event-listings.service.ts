import { Injectable } from '@nestjs/common';

import { type EventDto, type EventSortDto, type GetEventsQueryDto } from '@repo/schemas/events';
import { EventListingsRepository, filterListings } from './repositories/event-listings.repository';
import { stripListingMeta } from '../events/event.mapper';

@Injectable()
export class EventListingsService {
  constructor(private readonly repository: EventListingsRepository) {}

  async findAll(sort: EventSortDto): Promise<EventDto[]> {
    const events = await this.repository.findAll(sort);

    return events.map((record) => stripListingMeta(record));
  }

  async findFiltered(query: GetEventsQueryDto) {
    const records = await this.repository.findAll(query.sort);
    const { items, total } = filterListings(records, query);
    return { items: items.map((record) => stripListingMeta(record)), total };
  }

  async searchUsersEvents(userId: string, search?: string): Promise<EventDto[]> {
    const records = await this.repository.findRegisteredByUser(userId);
    const q = search?.trim().toLowerCase();
    const filtered = q
      ? records.filter((record) =>
          [record.title, record.location, record.address, ...record.category].some((v) =>
            v.toLowerCase().includes(q),
          ),
        )
      : records;
    return filtered.map((record) => stripListingMeta(record));
  }

  async findFeatured(): Promise<EventDto[]> {
    const events = await this.repository.findFeatured();

    return events.map((record) => stripListingMeta(record));
  }

  async getStats() {
    return this.repository.getStats();
  }

  async findRegisteredByUser(userId: string): Promise<EventDto[]> {
    const records = await this.repository.findRegisteredByUser(userId);
    return records.map((record) => stripListingMeta(record));
  }
}
