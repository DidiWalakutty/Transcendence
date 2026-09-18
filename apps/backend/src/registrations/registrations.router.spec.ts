import { describe, expect, it, vi } from 'vitest';
import { RegistrationsRouter } from './registrations.router';
import { RegistrationsService } from './registrations.service';
import type { RegistrationsRepository } from './repositories/registrations.repository';

function setup() {
  const cancel = vi.fn();
  const repository = { cancel } as unknown as RegistrationsRepository;
  const router = new RegistrationsRouter(new RegistrationsService(repository));
  return { router, cancel };
}

describe('registration cancellation', () => {
  // Expired sessions are rejected by ProtectedMiddleware before reaching the
  // router, so only authenticated flows are unit-tested here.
  it('rejects cancellation when no active registration exists', async () => {
    const { router, cancel } = setup();
    cancel.mockResolvedValue(null);
    await expect(
      router.cancel({ eventId: 'event' }, { user: { id: 'user' } }),
    ).rejects.toMatchObject({ code: 'CONFLICT' });
  });

  it('cancels only for the authenticated user and returns the changed registration', async () => {
    const { router, cancel } = setup();
    const registration = { eventId: 'event', userId: 'user', status: 'canceled' };
    cancel.mockResolvedValue(registration);
    await expect(router.cancel({ eventId: 'event' }, { user: { id: 'user' } })).resolves.toEqual(
      registration,
    );
    expect(cancel).toHaveBeenCalledWith('event', 'user');
  });
});
