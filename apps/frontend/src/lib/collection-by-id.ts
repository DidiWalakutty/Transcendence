type Identifiable = {
  id: PropertyKey;
};

export function upsertById<TItem extends Identifiable>(items: TItem[] | undefined, item: TItem) {
  if (!items) {
    return [item];
  }

  if (items.some((existingItem) => existingItem.id === item.id)) {
    return replaceById(items, item);
  }

  return [...items, item];
}

export function replaceById<TItem extends Identifiable>(items: TItem[] | undefined, item: TItem) {
  if (!items) {
    return items;
  }

  return items.map((existingItem) => (existingItem.id === item.id ? item : existingItem));
}

export function removeById<TItem extends Identifiable>(
  items: TItem[] | undefined,
  itemId: TItem['id'],
) {
  if (!items) {
    return items;
  }

  return items.filter((item) => item.id !== itemId);
}
