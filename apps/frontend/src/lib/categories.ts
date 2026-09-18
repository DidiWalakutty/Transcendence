import { eventCategories } from '@repo/schemas/events';
import * as m from '@/@generated/paraglide/messages';

const labelFns: Record<string, () => string> = {
  music: m.category_music,
  culture: m.category_culture,
  food: m.category_food,
  games: m.category_games,
  talks: m.category_talks,
  workshops: m.category_workshops,
};

export { eventCategories };

export function getCategoryLabel(id: string): string {
  return labelFns[id]?.() ?? id;
}

export function formatCategories(ids: string[]): string {
  return ids.map((id) => getCategoryLabel(id)).join(' • ');
}

export function getCategoryOptions(): { id: string; title: () => string }[] {
  return eventCategories.map((id) => ({ id, title: labelFns[id] ?? (() => id) }));
}
