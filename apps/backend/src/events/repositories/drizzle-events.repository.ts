import { Inject, Injectable } from '@nestjs/common';
import { events } from '@repo/schemas/database';

import { DATABASE } from '../../database/database.constants';
import type { Database } from '../../database/database.types';
import { EventsRepository, type CreateEventRecord } from './events.repository';

@Injectable()
export class DrizzleEventsRepository extends EventsRepository {
  constructor(
    @Inject(DATABASE)
    private readonly db: Database,
  ) {
    super();
  }

  // insert the new event into the database
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
        dateTime: new Date(data.dateTime),
        maxCapacity: data.maxCapacity,
        category: data.category,
      })
      .returning({ id: events.id });

    return event.id;
  }
}
