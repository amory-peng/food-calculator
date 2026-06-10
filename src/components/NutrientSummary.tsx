import { NutrientProgressBar } from './NutrientProgressBar';
import { nutrients, getProfileNutrients } from '../data/rda';
import type { NutrientTotals, MacroTargets, UserProfile, NutrientInfo } from '../types';

interface Props {
  totals: NutrientTotals;
  macroTargets: MacroTargets;
  defaultMacroTargets: MacroTargets;
  onMacroTargetsChange: (targets: MacroTargets) => void;
  userProfile: UserProfile | null;
}

export function NutrientSummary({ totals, macroTargets, defaultMacroTargets, onMacroTargetsChange, userProfile }: Props) {
  const activeNutrients: NutrientInfo[] = userProfile ? getProfileNutrients(userProfile) : nutrients;
  const vitamins = activeNutrients.filter(n => n.category === 'vitamin');
  const minerals = activeNutrients.filter(n => n.category === 'mineral');

  const macroNutrients = [
    { key: 'calories', label: 'Calories', unit: 'kcal', rda: macroTargets.calories, category: 'macro' as const },
    { key: 'protein', label: 'Protein', unit: 'g', rda: macroTargets.protein, category: 'macro' as const },
    { key: 'carbs', label: 'Carbs', unit: 'g', rda: macroTargets.carbs, category: 'macro' as const },
    { key: 'fat', label: 'Fat', unit: 'g', rda: macroTargets.fat, category: 'macro' as const },
    { key: 'fiber', label: 'Fiber', unit: 'g', rda: macroTargets.fiber, category: 'macro' as const },
  ];

  function handleTargetChange(key: keyof MacroTargets, value: string) {
    const num = parseFloat(value);
    onMacroTargetsChange({ ...macroTargets, [key]: isNaN(num) ? 0 : Math.max(0, num) });
  }

  return (
    <div className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-700">
        <h2 className="text-lg font-semibold text-gray-100">Daily Nutrient Summary</h2>
      </div>
      <div className="p-4 space-y-6">
        <section>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Macronutrients</h3>
            {JSON.stringify(macroTargets) !== JSON.stringify(defaultMacroTargets) && (
              <button
                onClick={() => onMacroTargetsChange(defaultMacroTargets)}
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                Reset to default
              </button>
            )}
          </div>
          <div className="space-y-1">
            {macroNutrients.map(n => (
              <div key={n.key} className="flex items-center gap-2">
                <div className="flex-1">
                  <NutrientProgressBar nutrient={n} current={totals[n.key] || 0} />
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <input
                    type="number"
                    min="0"
                    value={macroTargets[n.key as keyof MacroTargets] || ''}
                    onChange={e => handleTargetChange(n.key as keyof MacroTargets, e.target.value)}
                    className="w-16 px-1.5 py-0.5 bg-gray-900 border border-gray-600 rounded text-xs text-right text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <span className="text-[10px] text-gray-500">{n.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">Vitamins</h3>
          <div className="space-y-1">
            {vitamins.map(n => (
              <NutrientProgressBar key={n.key} nutrient={n} current={totals[n.key] || 0} />
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">Minerals</h3>
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
