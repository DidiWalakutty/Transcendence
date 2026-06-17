import { createTRPCContext } from '@trpc/tanstack-react-query';
import type { AppRouter } from '@repo/schemas/trpc';

export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>();
