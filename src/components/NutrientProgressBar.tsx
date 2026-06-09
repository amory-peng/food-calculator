import { useState } from 'react';
import { getAllFoods } from '../utils/search';
import type { NutrientInfo, FoodItem } from '../types';

interface Props {
  nutrient: NutrientInfo;
  current: number;
}

function getNutrientValue(food: FoodItem, key: string): number {
  if (key in food.macros) return food.macros[key as keyof typeof food.macros];
  if (key in food.micros) return food.micros[key as keyof typeof food.micros];
  return 0;
}

function formatValue(val: number): string {
  if (val >= 100) return Math.round(val).toString();
  if (val >= 10) return val.toFixed(1);
  return val.toFixed(2);
}

export function NutrientProgressBar({ nutrient, current }: Props) {
  const [expanded, setExpanded] = useState(false);

  const percentage = (current / nutrient.rda) * 100;
  const clampedWidth = Math.min(percentage, 100);

  let barColor: string;
  if (percentage >= 80) {
    barColor = 'bg-green-500';
  } else if (percentage >= 50) {
    barColor = 'bg-yellow-500';
  } else {
    barColor = 'bg-red-400';
  }

  const showDropdown = nutrient.category !== 'macro';

  return (
    <div>
      <div
        className={`flex items-center gap-3 py-1 ${showDropdown ? 'cursor-pointer hover:bg-gray-50 rounded -mx-1 px-1' : ''}`}
        onClick={showDropdown ? () => setExpanded(!expanded) : undefined}
      >
        <div className="w-24 text-sm text-gray-600 shrink-0 flex items-center gap-1">
          {showDropdown && (
            <span className={`text-[10px] text-gray-400 transition-transform ${expanded ? 'rotate-90' : ''}`}>▶</span>
          )}
          {nutrient.label}
        </div>
        <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${barColor}`}
            style={{ width: `${clampedWidth}%` }}
            role="progressbar"
            aria-valuenow={current}
            aria-valuemax={nutrient.rda}
          />
        </div>
        <div className="w-28 text-right text-xs text-gray-500 tabular-nums shrink-0">
          {formatValue(current)} / {nutrient.rda} {nutrient.unit}
        </div>
        <div className="w-12 text-right text-xs font-medium tabular-nums shrink-0"
          style={{ color: percentage >= 80 ? '#22c55e' : percentage >= 50 ? '#eab308' : '#f87171' }}
        >
          {Math.round(percentage)}%
        </div>
      </div>

      {expanded && showDropdown && <TopFoodsDropdown nutrientKey={nutrient.key} unit={nutrient.unit} />}
    </div>
  );
}

function TopFoodsDropdown({ nutrientKey, unit }: { nutrientKey: string; unit: string }) {
  const topFoods = getAllFoods()
    .map(food => ({ food, value: getNutrientValue(food, nutrientKey) }))
    .filter(r => r.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  if (topFoods.length === 0) return null;

  return (
    <div className="ml-8 mr-12 mb-2 mt-1 bg-gray-50 rounded border border-gray-100 p-2">
      <div className="text-[11px] text-gray-400 uppercase tracking-wide mb-1">Top foods (per 100g)</div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
        {topFoods.map(({ food, value }, i) => (
          <div key={food.id} className="flex items-baseline gap-1.5 text-xs text-gray-600">
            <span className="text-gray-400 w-4 text-right shrink-0">{i + 1}.</span>
            <span className="truncate">{food.name}</span>
            <span className="text-gray-400 ml-auto shrink-0">{formatValue(value)} {unit}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
