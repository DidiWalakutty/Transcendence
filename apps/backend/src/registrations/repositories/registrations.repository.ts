// Defines what operatoins are available.
// Repository for managing event registrations.
// Performs database operations related to registrations,
// such as checking ticket availability, creating,
// retrieving, and canceling registrations.

import type { registration } from '@repo/schemas/database';

export abstract class RegistrationsRepository {
  abstract getAvailableTickets(eventId: string): Promise<number>;

  abstract findActiveRegistration(eventId: string, userId: string): Promise<registration | null>;

  abstract create(eventId: string, userId: string): Promise<registration>;

  abstract cancel(eventId: string, userId: string): Promise<registration | null>;
}
