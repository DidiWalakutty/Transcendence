// Defines the data structures and validation schemas for event registrations using Zod.

import { z } from 'zod';

// Registering for an event
export const createRegistrationSchema = z.object({
  eventId: z.string(),
});

// A single registration
export const registrationSchema = z.object({
  eventId: z.string(),
  userId: z.string(),
  status: z.enum(['active', 'canceled']),
});

// Array of registrations
export const registrationsSchema = registrationSchema.array();

// Event attendee
export const eventAttendeeSchema = z.object({
  id: z.string(),
  name: z.string(),
  username: z.string(),
});

// List of event attendees
export const eventAttendeesList = eventAttendeeSchema.array();

// Event ticket availability
export const ticketAvailabilitySchema = z.object({
  eventId: z.string(),
  maxCapacity: z.number().int().positive(),
  registeredCount: z.number().int().nonnegative(),
  availableTickets: z.number().int().nonnegative(),
});

export type CreateRegistrationDto = z.infer<typeof createRegistrationSchema>;
export type RegistrationDto = z.infer<typeof registrationSchema>;
export type EventAttendeeDto = z.infer<typeof eventAttendeeSchema>;
export type TicketAvailabilityDto = z.infer<typeof ticketAvailabilitySchema>;
