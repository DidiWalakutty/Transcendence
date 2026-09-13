// This file contains the router for the registrations module.
// It defines the API endpoints for registration-related operations, such as registering, canceling, and checking ticket availability for events.

// RegistrationsRouter = Handles API requests for event registrations
// RegistrationsService = Contains the business logic for registering and canceling event registrations
// createRegistrationSchema = Validates the event ID sent when registering or canceling
// registrationSchema = Describes the structure of a registration object (active, canceled etc)
// ticketAvailabilitySchema = Defines the ticket capacity and availability information for an event
// CreateRegistrationDto = TypeScript type for the input data when registering or canceling

import { Router, Mutation, Query, Input, Ctx } from 'nestjs-trpc';

import { createRegistrationSchema, registrationSchema } from '@repo/schemas/registrations';

import type { CreateRegistrationDto } from '@repo/schemas/registrations';
import { eventAttendeesList } from '@repo/schemas/registrations';
import { unauthorizedError } from '../trpc/trpc.errors';
import { RegistrationsService } from './registrations.service';
import { eventIdSchema } from '@repo/schemas/events';
import { z } from 'zod';

// Handles API requests for event registrations
@Router({ alias: 'registrations' })
export class RegistrationsRouter {
  constructor(private readonly registrationsService: RegistrationsService) {}

  // Registers the logged-in user for an event
  @Mutation({
    input: createRegistrationSchema,
    output: registrationSchema,
  })
  async register(
    @Input() input: CreateRegistrationDto,
    @Ctx() ctx: { user: { id: string } | null },
  ) {
    if (!ctx.user) {
      throw unauthorizedError('Not logged in');
    }
    return this.registrationsService.register(input.eventId, ctx.user.id);
  }

  // Cancels the logged-in user's registration for an event
  @Mutation({
    input: createRegistrationSchema,
    output: registrationSchema,
  })
  async cancel(@Input() input: CreateRegistrationDto, @Ctx() ctx: { user: { id: string } | null }) {
    if (!ctx.user) {
      throw unauthorizedError('Not logged in');
    }

    return this.registrationsService.cancel(input.eventId, ctx.user.id);
  }

  // Gets the number of available tickets for an event
  @Query({
    input: eventIdSchema,
    output: z.number(),
  })
  async getAvailableTickets(@Input() input: { id: string }) {
    return this.registrationsService.getAvailableTickets(input.id);
  }

  // Gets the logged-in user's active registration for an event
  @Query({
    input: eventIdSchema,
    output: registrationSchema.nullable(),
  })
  async getMyRegistration(
    @Input() input: { id: string },
    @Ctx() ctx: { user: { id: string } | null },
  ) {
    if (!ctx.user) {
      return null;
    }
    return this.registrationsService.getMyRegistration(input.id, ctx.user.id);
  }

  // Gets a list of users who are registered for an event
  @Query({
    input: eventIdSchema,
    output: eventAttendeesList,
  })
  async getEventAttendees(
    @Input() input: { id: string },
    @Ctx() ctx: { user: { id: string } | null },
  ) {
    if (!ctx.user) {
      throw unauthorizedError('Not logged in');
    }
    return this.registrationsService.getEventAttendees(input.id, ctx.user.id);
  }
}
