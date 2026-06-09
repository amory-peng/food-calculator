import type { FoodItem } from '../types';

const API_KEY = 'DEMO_KEY';
const BASE_URL = 'https://api.nal.usda.gov/fdc/v1';

interface UsdaNutrient {
  nutrientId: number;
  nutrientName: string;
  value: number;
}

interface UsdaFood {
  fdcId: number;
  description: string;
  foodCategory?: string;
  brandOwner?: string;
  foodNutrients: UsdaNutrient[];
}

const NUTRIENT_MAP: Record<number, string> = {
  1008: 'calories',
  1003: 'protein',
  1005: 'carbs',
  1004: 'fat',
  1079: 'fiber',
  1106: 'vitaminA',
  1162: 'vitaminC',
  1114: 'vitaminD',
  1109: 'vitaminE',
  1185: 'vitaminK',
  1175: 'vitaminB6',
  1178: 'vitaminB12',
  1177: 'folate',
  1087: 'calcium',
  1089: 'iron',
  1090: 'magnesium',
  1092: 'potassium',
  1093: 'sodium',
  1095: 'zinc',
};

function mapUsdaFood(usda: UsdaFood): FoodItem {
  const macros = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
  const micros = {
    vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0, vitaminK: 0,
    vitaminB6: 0, vitaminB12: 0, folate: 0,
    calcium: 0, iron: 0, magnesium: 0, potassium: 0, sodium: 0, zinc: 0,
  };

  for (const n of usda.foodNutrients) {
    const key = NUTRIENT_MAP[n.nutrientId];
    if (!key) continue;
    if (key in macros) {
      macros[key as keyof typeof macros] = n.value || 0;
    } else {
      micros[key as keyof typeof micros] = n.value || 0;
    }
  }

  return {
    id: `usda-${usda.fdcId}`,
    name: usda.description,
    category: usda.foodCategory || 'USDA Import',
    macros,
    micros,
  };
}

export async function searchUsda(query: string): Promise<FoodItem[]> {
  const params = new URLSearchParams({
    api_key: API_KEY,
    query,
    pageSize: '10',
    dataType: 'SR Legacy,Foundation',
  });

  const res = await fetch(`${BASE_URL}/foods/search?${params}`);
  if (!res.ok) throw new Error(`USDA API error: ${res.status}`);

  const data = await res.json();
  return (data.foods || []).map(mapUsdaFood);
}
