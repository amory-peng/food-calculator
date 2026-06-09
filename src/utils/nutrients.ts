import type { FoodEntry, FoodItem, NutrientTotals } from '../types';
import { getFoodById } from './search';
import { nutrients } from '../data/rda';

export function getScaledNutrients(food: FoodItem, grams: number): NutrientTotals {
  const scale = grams / 100;
  const totals: NutrientTotals = {};

  for (const key of Object.keys(food.macros)) {
    totals[key] = food.macros[key as keyof typeof food.macros] * scale;
  }
  for (const key of Object.keys(food.micros)) {
    totals[key] = food.micros[key as keyof typeof food.micros] * scale;
  }

  return totals;
}

export function computeTotals(entries: FoodEntry[]): NutrientTotals {
  const totals: NutrientTotals = {};

  for (const info of nutrients) {
    totals[info.key] = 0;
  }

  for (const entry of entries) {
    if (!entry.foodId) continue;
    const food = getFoodById(entry.foodId);
    if (!food) continue;

    const scaled = getScaledNutrients(food, entry.amountGrams);
    for (const key of Object.keys(scaled)) {
      totals[key] = (totals[key] || 0) + scaled[key];
    }
  }

  return totals;
}
