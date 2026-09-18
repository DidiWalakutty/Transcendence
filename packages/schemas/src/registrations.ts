// Defines the data structures and validation schemas for event registrations using Zod.

import { z } from 'zod';

// Registering for an event
export const createRegistrationSchema = z.object({
  eventId: z.string(),
});

export const registrationStatusSchema = z.enum(['active', 'canceled']);

export function isActiveRegistrationStatus(status: string): boolean {
  return status === 'active';
}

// A single registration
export const registrationSchema = z.object({
  eventId: z.string(),
  userId: z.string(),
  status: registrationStatusSchema,
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

export const attendeeCountSchema = z.object({
  eventId: z.string(),
  count: z.number().int().nonnegative(),
});

export const attendeeCountsSchema = attendeeCountSchema.array();

// Event ticket availability
export const ticketAvailabilitySchema = z.object({
  eventId: z.string(),
  maxCapacity: z.number().int().positive(),
  registeredCount: z.number().int().nonnegative(),
  availableTickets: z.number().int().nonnegative(),
});

export const registrationStatusReasonSchema = z.enum([
  'NOT_LOGGED_IN',
  'ALREADY_REGISTERED',
  'SOLD_OUT',
  'OK',
]);

export const registrationStatusResponseSchema = z.object({
  available: z.number().int().nonnegative(),
  myRegistration: registrationSchema.nullable(),
  canRegister: z.boolean(),
  reason: registrationStatusReasonSchema,
});

export type CreateRegistrationDto = z.infer<typeof createRegistrationSchema>;
export type RegistrationDto = z.infer<typeof registrationSchema>;
export type EventAttendeeDto = z.infer<typeof eventAttendeeSchema>;
export type TicketAvailabilityDto = z.infer<typeof ticketAvailabilitySchema>;
export type AttendeeCountDto = z.infer<typeof attendeeCountSchema>;
export type RegistrationStatusReason = z.infer<typeof registrationStatusReasonSchema>;
export type RegistrationStatusResponse = z.infer<typeof registrationStatusResponseSchema>;
