// Defines what operations are available.
// Repository for managing event registrations.
// Performs database operations related to registrations,
// such as checking ticket availability, creating,
// retrieving, and canceling registrations.

import type { registration } from '@repo/schemas/database';
import type { AttendeeCountDto, EventAttendeeDto } from '@repo/schemas/registrations';

export type RegisterResult =
  | { type: 'success'; registration: registration }
  | { type: 'event-not-found' }
  | { type: 'already-registered' }
  | { type: 'sold-out' };

export abstract class RegistrationsRepository {
  abstract getAvailableTickets(eventId: string): Promise<number>;

  abstract findActiveRegistration(eventId: string, userId: string): Promise<registration | null>;

  abstract isEventOrganizer(eventId: string, userId: string): Promise<boolean>;

  abstract getEventAttendees(eventId: string): Promise<EventAttendeeDto[]>;

  abstract getAttendeeCounts(eventIds: string[]): Promise<AttendeeCountDto[]>;

  abstract register(eventId: string, userId: string): Promise<RegisterResult>;

  abstract create(eventId: string, userId: string): Promise<registration>;

  abstract cancel(eventId: string, userId: string): Promise<registration | null>;
}
