import type { CreateEventDto } from '@repo/schemas/events';

// Backend adds the organizerId to the CreateEventDto to form a complete record for creating an event
export type CreateEventRecord = CreateEventDto & {
  organizerId: string;
};

export abstract class EventsRepository {
  abstract create(data: CreateEventRecord): Promise<string>;
}
