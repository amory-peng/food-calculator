import { useMemo } from 'react';
import { nutrients } from '../data/rda';
import { getAllFoods } from '../utils/search';
import type { NutrientTotals, FoodItem, NutrientInfo } from '../types';

interface Props {
  totals: NutrientTotals;
}

interface Recommendation {
  nutrient: NutrientInfo;
  percentage: number;
  gap: number;
  topFoods: { food: FoodItem; valuePer100g: number }[];
}

function getNutrientValue(food: FoodItem, key: string): number {
  if (key in food.macros) return food.macros[key as keyof typeof food.macros];
  if (key in food.micros) return food.micros[key as keyof typeof food.micros];
  return 0;
}

export function DeficiencyRecommendations({ totals }: Props) {
  const recommendations = useMemo(() => {
    const allFoods = getAllFoods();
    const deficient: Recommendation[] = [];

    for (const nutrient of nutrients) {
      if (nutrient.category === 'macro') continue;

      const current = totals[nutrient.key] || 0;
      const percentage = (current / nutrient.rda) * 100;

      if (percentage >= 80) continue;

      const gap = nutrient.rda - current;

      const ranked = allFoods
        .map(food => ({ food, valuePer100g: getNutrientValue(food, nutrient.key) }))
        .filter(r => r.valuePer100g > 0)
        .sort((a, b) => b.valuePer100g - a.valuePer100g)
        .slice(0, 3);

      deficient.push({ nutrient, percentage, gap, topFoods: ranked });
    }

    deficient.sort((a, b) => a.percentage - b.percentage);
    return deficient;
  }, [totals]);

  if (recommendations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Recommendations</h2>
        <p className="text-sm text-green-600">You're meeting at least 80% of your RDA for all tracked nutrients!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Deficiency Recommendations</h2>
        <p className="text-xs text-gray-500 mt-0.5">Nutrients below 80% of RDA, with foods to help fill the gap</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <th className="text-left py-2 px-3">Nutrient</th>
              <th className="text-right py-2 px-3">Current</th>
              <th className="text-right py-2 px-3">Gap</th>
              <th className="text-left py-2 px-3">Top Foods (per 100g)</th>
            </tr>
          </thead>
          <tbody>
            {recommendations.map(rec => (
              <tr key={rec.nutrient.key} className="border-b border-gray-100 align-top">
                <td className="py-2.5 px-3">
                  <div className="text-sm font-medium text-gray-800">{rec.nutrient.label}</div>
                  <div className="text-xs text-gray-400">
                    <span
                      className={rec.percentage < 50 ? 'text-red-500' : 'text-yellow-600'}
                    >
                      {Math.round(rec.percentage)}%
                    </span>
                    {' '}of RDA
                  </div>
                </td>
                <td className="py-2.5 px-3 text-right text-sm text-gray-600 tabular-nums whitespace-nowrap">
                  {formatValue(totals[rec.nutrient.key] || 0)} / {rec.nutrient.rda} {rec.nutrient.unit}
                </td>
                <td className="py-2.5 px-3 text-right text-sm text-red-500 tabular-nums whitespace-nowrap">
                  -{formatValue(rec.gap)} {rec.nutrient.unit}
                </td>
                <td className="py-2.5 px-3">
                  <ul className="space-y-0.5">
                    {rec.topFoods.map(({ food, valuePer100g }) => (
                      <li key={food.id} className="text-sm text-gray-700">
                        <span>{food.name}</span>
                        <span className="ml-1.5 text-xs text-gray-400">
                          ({formatValue(valuePer100g)} {rec.nutrient.unit})
                        </span>
                      </li>
                    ))}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatValue(val: number): string {
  if (val >= 100) return Math.round(val).toString();
  if (val >= 10) return val.toFixed(1);
  return val.toFixed(2);
}
