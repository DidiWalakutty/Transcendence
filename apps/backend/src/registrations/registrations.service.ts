import { Injectable } from '@nestjs/common';
import { RegistrationsRepository } from './repositories/registrations.repository';
import { conflictError } from '../trpc/trpc.errors';

@Injectable()
export class RegistrationsService {
  constructor(private readonly repository: RegistrationsRepository) {}

  // Returns how many tickets are still available for given event
  async getAvailableTickets(eventId: string): Promise<number> {
    return this.repository.getAvailableTickets(eventId);
  }

  // Returns the logged-in user's active registration for an event
  async getMyRegistration(eventId: string, userId: string) {
    return this.repository.findActiveRegistration(eventId, userId);
  }

  // Registers a user for an event if not already registered and if tickets are available
  async register(eventId: string, userId: string) {
    const existingRegistration = await this.repository.findActiveRegistration(eventId, userId);

    if (existingRegistration) {
      throw conflictError('User is already registered for this event.');
    }

    const availableTickets = await this.getAvailableTickets(eventId);

    if (availableTickets <= 0) {
      throw conflictError('No tickets available for this event.');
    }

    return this.repository.create(eventId, userId);
  }

  // Cancels the user's active registration.
  // The ticket becomes available again, because canceled registrations are not
  // counted by getAvailableTickets()
  async cancel(eventId: string, userId: string) {
    const registration = await this.repository.cancel(eventId, userId);

    if (!registration) {
      throw conflictError('Registration not found.');
    }

    return registration;
  }
}
