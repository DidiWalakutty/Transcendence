export function filterByFields<T>(
  items: T[],
  query: string,
  pick: (item: T) => (string | null | undefined)[],
): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter((item) => pick(item).some((v) => v?.toLowerCase().includes(q)));
}

export function toIdSet(ids: (string | number | symbol)[] | Iterable<string>): Set<string> {
  return new Set(ids as string[]);
}
