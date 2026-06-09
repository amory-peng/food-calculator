import { useState } from 'react';
import type { FoodEntry } from '../types';
import { getFoodById } from '../utils/search';
import { getScaledNutrients } from '../utils/nutrients';
import { nutrients } from '../data/rda';

interface Props {
  entries: FoodEntry[];
  onUpdateAmount: (id: string, grams: number) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
}

function formatValue(val: number): string {
  if (val >= 100) return Math.round(val).toString();
  if (val >= 10) return val.toFixed(1);
  return val.toFixed(2);
}

function FoodRow({ entry, onUpdateAmount, onRemove }: {
  entry: FoodEntry;
  onUpdateAmount: (id: string, grams: number) => void;
  onRemove: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const food = entry.foodId ? getFoodById(entry.foodId) : null;
  const scaled = food ? getScaledNutrients(food, entry.amountGrams) : null;

  const vitamins = nutrients.filter(n => n.category === 'vitamin');
  const minerals = nutrients.filter(n => n.category === 'mineral');

  return (
    <>
      <tr className="border-b border-gray-100 hover:bg-gray-50">
        <td className="py-2 px-3 text-sm text-gray-800">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 text-left hover:text-blue-600 transition-colors"
          >
            <span className={`text-[10px] text-gray-400 transition-transform ${expanded ? 'rotate-90' : ''}`}>▶</span>
            {entry.foodName}
          </button>
        </td>
        <td className="py-2 px-3 w-24">
          <input
            type="number"
            min="0"
            value={entry.amountGrams || ''}
            onChange={e => {
              const val = parseFloat(e.target.value);
              onUpdateAmount(entry.id, isNaN(val) ? 0 : Math.max(0, val));
            }}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </td>
        <td className="py-2 px-3 text-right text-sm text-gray-600 tabular-nums">
          {scaled ? Math.round(scaled.calories) : '—'}
        </td>
        <td className="py-2 px-3 text-right text-sm text-gray-600 tabular-nums">
          {scaled ? scaled.protein.toFixed(1) : '—'}
        </td>
        <td className="py-2 px-3 text-right text-sm text-gray-600 tabular-nums">
          {scaled ? scaled.carbs.toFixed(1) : '—'}
        </td>
        <td className="py-2 px-3 text-right text-sm text-gray-600 tabular-nums">
          {scaled ? scaled.fat.toFixed(1) : '—'}
        </td>
        <td className="py-2 px-2 w-10">
          <button
            onClick={() => onRemove(entry.id)}
            className="text-gray-400 hover:text-red-500 transition-colors p-1"
            aria-label="Remove food"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
            </svg>
          </button>
        </td>
      </tr>
      {expanded && scaled && (
        <tr className="border-b border-gray-100">
          <td colSpan={7} className="px-3 py-2 bg-gray-50">
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 ml-5">
              <div>
                <div className="text-[11px] text-gray-400 uppercase tracking-wide mb-1">Vitamins</div>
                <div className="space-y-0.5">
                  {vitamins.map(n => {
                    const val = scaled[n.key] || 0;
                    const pct = (val / n.rda) * 100;
                    return (
                      <div key={n.key} className="flex items-center gap-2 text-xs">
                        <span className="w-20 text-gray-600 shrink-0">{n.label}</span>
                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-red-400'}`}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                        <span className="w-20 text-right text-gray-500 tabular-nums shrink-0">
                          {formatValue(val)} {n.unit}
                        </span>
                        <span className="w-10 text-right tabular-nums shrink-0"
                          style={{ color: pct >= 80 ? '#22c55e' : pct >= 50 ? '#eab308' : '#f87171' }}
                        >
                          {Math.round(pct)}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-gray-400 uppercase tracking-wide mb-1">Minerals</div>
                <div className="space-y-0.5">
                  {minerals.map(n => {
                    const val = scaled[n.key] || 0;
                    const pct = (val / n.rda) * 100;
                    return (
                      <div key={n.key} className="flex items-center gap-2 text-xs">
                        <span className="w-20 text-gray-600 shrink-0">{n.label}</span>
                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-red-400'}`}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                        <span className="w-20 text-right text-gray-500 tabular-nums shrink-0">
                          {formatValue(val)} {n.unit}
                        </span>
                        <span className="w-10 text-right tabular-nums shrink-0"
                          style={{ color: pct >= 80 ? '#22c55e' : pct >= 50 ? '#eab308' : '#f87171' }}
                        >
                          {Math.round(pct)}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export function FoodLog({ entries, onUpdateAmount, onRemove, onClear }: Props) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Food Log</h2>
        {entries.length > 0 && (
          <button
            onClick={onClear}
            className="text-sm text-gray-500 hover:text-red-500 transition-colors px-2 py-1"
          >
            Clear All
          </button>
        )}
      </div>
      {entries.length === 0 ? (
        <div className="py-12 text-center text-gray-400">
          <p className="text-sm">No foods added yet.</p>
          <p className="text-xs mt-1">Use the search above to add foods.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
                <th className="text-left py-2 px-3">Food</th>
                <th className="text-right py-2 px-3">Amount (g)</th>
                <th className="text-right py-2 px-3">Cal</th>
                <th className="text-right py-2 px-3">Protein</th>
                <th className="text-right py-2 px-3">Carbs</th>
                <th className="text-right py-2 px-3">Fat</th>
                <th className="py-2 px-2"></th>
              </tr>
            </thead>
            <tbody>
              {entries.map(entry => (
                <FoodRow
                  key={entry.id}
                  entry={entry}
                  onUpdateAmount={onUpdateAmount}
                  onRemove={onRemove}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
