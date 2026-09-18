export { getUserLabel, resolveUserDisplayName } from '@repo/schemas/users';

export function toIdSet(items: { id: string }[] | string[]): Set<string> {
  if (items.length === 0) return new Set();
  if (typeof items[0] === 'string') return new Set(items as string[]);
  return new Set((items as { id: string }[]).map((i) => i.id));
}
