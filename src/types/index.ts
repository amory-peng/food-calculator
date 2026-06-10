export interface Macros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface Micros {
  vitaminA: number;
  vitaminC: number;
  vitaminD: number;
  vitaminE: number;
  vitaminK: number;
  vitaminB6: number;
  vitaminB12: number;
  thiamin: number;
  riboflavin: number;
  niacin: number;
  folate: number;
  choline: number;
  calcium: number;
  iron: number;
  magnesium: number;
  potassium: number;
  sodium: number;
  zinc: number;
  selenium: number;
  copper: number;
  manganese: number;
  iodine: number;
  phosphorus: number;
}

export interface FoodItem {
  id: string;
  name: string;
  category: string;
  macros: Macros;
  micros: Micros;
}

export interface FoodEntry {
  id: string;
  foodId: string | null;
  foodName: string;
  amountGrams: number;
  customMacros?: Partial<Macros>;
  customMicros?: Partial<Micros>;
}

export interface NutrientInfo {
  key: string;
  label: string;
  unit: string;
  rda: number;
  category: 'macro' | 'vitamin' | 'mineral';
}

export type NutrientTotals = Record<string, number>;

export interface MacroTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface FoodMacroOverride {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
}

export type FoodMacroOverrides = Record<string, FoodMacroOverride>;

export interface UserProfile {
  gender: 'male' | 'female';
  age: number;
  weightKg: number;
  heightCm: number;
}
