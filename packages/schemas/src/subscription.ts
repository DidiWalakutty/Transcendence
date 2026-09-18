import { z } from 'zod';

export function subscriptionSchema<T>() {
  return z.custom<AsyncIterable<T>>();
}
