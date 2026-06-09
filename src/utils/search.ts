import foodData from '../data/foods.json';
import { getCustomFoods } from './customFoods';
import type { FoodItem } from '../types';

function buildIndex(foods: FoodItem[]) {
  return foods.map(item => ({ item, nameLower: item.name.toLowerCase() }));
}

const bundledIndex = buildIndex(foodData as FoodItem[]);

export function searchFoods(query: string, limit = 10): FoodItem[] {
  if (query.length < 2) return [];

  const customIndex = buildIndex(getCustomFoods());
  const fullIndex = [...bundledIndex, ...customIndex];

  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const results: { item: FoodItem; score: number }[] = [];

  for (const entry of fullIndex) {
    const allMatch = terms.every(term => entry.nameLower.includes(term));
    if (!allMatch) continue;

    let score = 0;
    if (entry.nameLower.startsWith(terms[0])) score += 10;
    score -= entry.nameLower.length * 0.01;

    results.push({ item: entry.item, score });
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit).map(r => r.item);
}

export function getFoodById(id: string): FoodItem | undefined {
  const bundled = (foodData as FoodItem[]).find(f => f.id === id);
  if (bundled) return bundled;
  return getCustomFoods().find(f => f.id === id);
}

export function getAllFoods(): FoodItem[] {
  return [...(foodData as FoodItem[]), ...getCustomFoods()];
}
