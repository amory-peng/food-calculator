import type { FoodEntry, FoodItem, NutrientTotals, FoodMacroOverrides } from '../types';
import { getFoodById } from './search';
import { nutrients } from '../data/rda';

export function getScaledNutrients(food: FoodItem, grams: number, overrides?: FoodMacroOverrides): NutrientTotals {
  const scale = grams / 100;
  const totals: NutrientTotals = {};
  const foodOverride = overrides?.[food.id];

  for (const key of Object.keys(food.macros)) {
    const base = foodOverride && key in foodOverride
      ? (foodOverride[key as keyof typeof foodOverride] ?? food.macros[key as keyof typeof food.macros])
      : food.macros[key as keyof typeof food.macros];
    totals[key] = base * scale;
  }
  for (const key of Object.keys(food.micros)) {
    totals[key] = food.micros[key as keyof typeof food.micros] * scale;
  }

  return totals;
}

export function computeTotals(entries: FoodEntry[], overrides?: FoodMacroOverrides): NutrientTotals {
  const totals: NutrientTotals = {};

  for (const info of nutrients) {
    totals[info.key] = 0;
  }

  for (const entry of entries) {
    if (!entry.foodId) continue;
    const food = getFoodById(entry.foodId);
    if (!food) continue;

    const scaled = getScaledNutrients(food, entry.amountGrams, overrides);
    for (const key of Object.keys(scaled)) {
      totals[key] = (totals[key] || 0) + scaled[key];
    }
  }

  return totals;
}
