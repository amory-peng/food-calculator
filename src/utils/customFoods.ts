import type { FoodItem } from '../types';

const STORAGE_KEY = 'nutrient-calc-custom-foods';

export function getCustomFoods(): FoodItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveCustomFood(food: FoodItem): void {
  const foods = getCustomFoods();
  if (foods.some(f => f.id === food.id)) return;
  foods.push(food);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(foods));
}
