// Defines the operations needed to interact with events.
// create() saves a new event and returns the ID generated for it.
// findById() finds and returns an event using its ID.
import type { CreateEventDto, EventDto, UpdateEventDto } from '@repo/schemas/events';

// The CreateEventRecord type is used when creating a new event in the database.
// It adds the organizerId to the CreateEventDto.
export type CreateEventRecord = CreateEventDto & {
  organizerId: string;
};

export abstract class EventsRepository {
  abstract create(data: CreateEventRecord): Promise<string>;
  abstract findById(id: string): Promise<EventDto | null>;
  abstract findAll(): Promise<EventDto[]>;
  abstract findByOrganizer(organizerId: string): Promise<EventDto[]>;
  abstract update(data: UpdateEventDto): Promise<EventDto | null>;
  abstract delete(id: string): Promise<EventDto | null>;
}
