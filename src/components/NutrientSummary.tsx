import { NutrientProgressBar } from './NutrientProgressBar';
import { nutrients } from '../data/rda';
import type { NutrientTotals } from '../types';

interface Props {
  totals: NutrientTotals;
}

export function NutrientSummary({ totals }: Props) {
  const macros = nutrients.filter(n => n.category === 'macro');
  const vitamins = nutrients.filter(n => n.category === 'vitamin');
  const minerals = nutrients.filter(n => n.category === 'mineral');

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Daily Nutrient Summary</h2>
      </div>
      <div className="p-4 space-y-6">
        <section>
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Macronutrients</h3>
          <div className="space-y-1">
            {macros.map(n => (
              <NutrientProgressBar key={n.key} nutrient={n} current={totals[n.key] || 0} />
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Vitamins</h3>
          <div className="space-y-1">
            {vitamins.map(n => (
              <NutrientProgressBar key={n.key} nutrient={n} current={totals[n.key] || 0} />
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Minerals</h3>
          <div className="space-y-1">
            {minerals.map(n => (
              <NutrientProgressBar key={n.key} nutrient={n} current={totals[n.key] || 0} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
