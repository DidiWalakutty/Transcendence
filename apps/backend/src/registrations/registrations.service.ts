import { Injectable } from '@nestjs/common';
import { RegistrationsRepository } from './repositories/registrations.repository';
import { conflictError, forbiddenError, notFoundError } from '../trpc/trpc.errors';
import { APP_EVENTS, emitAppEvent } from '../events/app-events';

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

  // Registers a user for an event and handles the possible registration results.
  async register(eventId: string, userId: string) {
    const result = await this.repository.register(eventId, userId);

    switch (result.type) {
      case 'event-not-found':
        throw notFoundError('Event not found.');
      case 'already-registered':
        throw conflictError('User is already registered for this event.');
      case 'sold-out':
        throw conflictError('No tickets available for this event.');
      case 'success':
        emitAppEvent(APP_EVENTS.registrationCreated, { userId, eventId });
        return result.registration;
    }
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

  // Returns a list of users who are registered for an event
  async getEventAttendees(eventId: string, userId: string, isAdmin: boolean) {
    if (!isAdmin) {
      const isOrganizer = await this.repository.isEventOrganizer(eventId, userId);

      if (!isOrganizer) {
        throw forbiddenError('User is not the organizer of this event.');
      }
    }

    return this.repository.getEventAttendees(eventId);
  }

  async getAttendeeCounts(eventIds: string[]) {
    return this.repository.getAttendeeCounts(eventIds);
  }

  async getRegistrationStatus(eventId: string, userId: string | null) {
    const [available, myRegistration] = await Promise.all([
      this.repository.getAvailableTickets(eventId),
      userId ? this.repository.findActiveRegistration(eventId, userId) : Promise.resolve(null),
    ]);
    if (!userId) {
      return {
        available,
        myRegistration: null,
        canRegister: false,
        reason: 'NOT_LOGGED_IN' as const,
      };
    }
    if (myRegistration) {
      return {
        available,
        myRegistration,
        canRegister: false,
        reason: 'ALREADY_REGISTERED' as const,
      };
    }
    if (available <= 0) {
      return { available, myRegistration: null, canRegister: false, reason: 'SOLD_OUT' as const };
    }
    return { available, myRegistration: null, canRegister: true, reason: 'OK' as const };
  }
}
