// This file contains the router for the registrations module.
// It defines the API endpoints for registration-related operations, such as registering, canceling, and checking ticket availability for events.

// RegistrationsRouter = Handles API requests for event registrations
// RegistrationsService = Contains the business logic for registering and canceling event registrations
// createRegistrationSchema = Validates the event ID sent when registering or canceling
// registrationSchema = Describes the structure of a registration object (active, canceled etc)
// ticketAvailabilitySchema = Defines the ticket capacity and availability information for an event
// CreateRegistrationDto = TypeScript type for the input data when registering or canceling

import { Router, Mutation, Query, Input, Ctx, UseMiddlewares } from 'nestjs-trpc';

import {
  attendeeCountsSchema,
  createRegistrationSchema,
  registrationSchema,
  registrationStatusResponseSchema,
} from '@repo/schemas/registrations';

import type { CreateRegistrationDto } from '@repo/schemas/registrations';
import { eventAttendeesList } from '@repo/schemas/registrations';
import { ProtectedMiddleware } from '../auth/protected.middleware';
import type { OptionalAuthCtx, ProtectedCtx } from '../auth/auth.types';
import { RegistrationsService } from './registrations.service';
import { eventIdSchema } from '@repo/schemas/events';
import { z } from 'zod';
import { hasAdminRole } from '../auth/roles';

// Handles API requests for event registrations
@Router({ alias: 'registrations' })
export class RegistrationsRouter {
  constructor(private readonly registrationsService: RegistrationsService) {}

  // Registers the logged-in user for an event
  @UseMiddlewares(ProtectedMiddleware)
  @Mutation({
    input: createRegistrationSchema,
    output: registrationSchema,
  })
  async register(@Input() input: CreateRegistrationDto, @Ctx() ctx: ProtectedCtx) {
    return this.registrationsService.register(input.eventId, ctx.user.id);
  }

  // Cancels the logged-in user's registration for an event
  @UseMiddlewares(ProtectedMiddleware)
  @Mutation({
    input: createRegistrationSchema,
    output: registrationSchema,
  })
  async cancel(@Input() input: CreateRegistrationDto, @Ctx() ctx: ProtectedCtx) {
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
  async getMyRegistration(@Input() input: { id: string }, @Ctx() ctx: OptionalAuthCtx) {
    if (!ctx.user) {
      return null;
    }
    return this.registrationsService.getMyRegistration(input.id, ctx.user.id);
  }

  // Gets a list of users who are registered for an event
  @UseMiddlewares(ProtectedMiddleware)
  @Query({
    input: eventIdSchema,
    output: eventAttendeesList,
  })
  async getEventAttendees(@Input() input: { id: string }, @Ctx() ctx: ProtectedCtx) {
    return this.registrationsService.getEventAttendees(
      input.id,
      ctx.user.id,
      hasAdminRole(ctx.user),
    );
  }

  @Query({
    input: eventIdSchema,
    output: registrationStatusResponseSchema,
  })
  async getRegistrationStatus(@Input() input: { id: string }, @Ctx() ctx: OptionalAuthCtx) {
    return this.registrationsService.getRegistrationStatus(input.id, ctx.user?.id ?? null);
  }

  @UseMiddlewares(ProtectedMiddleware)
  @Query({
    input: z.object({ ids: z.uuid().array().max(100) }),
    output: attendeeCountsSchema,
  })
  async getAttendeeCounts(@Input() input: { ids: string[] }) {
    return this.registrationsService.getAttendeeCounts(input.ids);
  }
}
