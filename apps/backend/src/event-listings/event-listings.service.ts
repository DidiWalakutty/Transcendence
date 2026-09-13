import { Injectable } from '@nestjs/common';

import { type EventDto, type EventSortDto } from '@repo/schemas/events';
import { EventListingsRepository } from './repositories/event-listings.repository';

@Injectable()
export class EventListingsService {
  constructor(private readonly repository: EventListingsRepository) {}

  async findAll(sort: EventSortDto): Promise<EventDto[]> {
    const events = await this.repository.findAll(sort);

    return events.map(
      ({ createdAt: _createdAt, registrationsCount: _registrationsCount, ...event }) => event,
    );
  }

  async findFeatured(): Promise<EventDto[]> {
    const events = await this.repository.findFeatured();

    return events.map(
      ({ createdAt: _createdAt, registrationsCount: _registrationsCount, ...event }) => event,
    );
  }

  async getStats() {
    return this.repository.getStats();
  }

  async findRegisteredByUser(userId: string): Promise<EventDto[]> {
    const records = await this.repository.findRegisteredByUser(userId);
    return records.map(
      ({ createdAt: _createdAt, registrationsCount: _registrationsCount, ...event }) => event,
    );
  }

  async cancelUserRegistration(eventId: string, userId: string): Promise<void> {
    await this.repository.cancelUserRegistration(eventId, userId);
  }
}
