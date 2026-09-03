import { describe, expect, it, vi } from 'vitest';
import type { MiddlewareOptions } from 'nestjs-trpc';

import { AdminMiddleware } from './admin.middleware';

describe('AdminMiddleware', () => {
  const middleware = new AdminMiddleware();

  it('allows Better Auth admin roles', async () => {
    const next = vi.fn().mockResolvedValue('ok');

    await expect(
      middleware.use({
        ctx: { session: {}, user: { role: 'admin' } },
        next,
      } as unknown as MiddlewareOptions),
    ).resolves.toBe('ok');
    expect(next).toHaveBeenCalledOnce();
  });

  it('rejects authenticated regular users', async () => {
    await expect(
      middleware.use({
        ctx: { session: {}, user: { role: 'user' } },
        next: vi.fn(),
      } as unknown as MiddlewareOptions),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});
