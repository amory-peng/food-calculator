import { useState } from 'react';
import type { FoodEntry, FoodItem, FoodMacroOverrides, FoodMacroOverride, Macros, Micros } from '../types';
import { getFoodById } from '../utils/search';
import { getScaledNutrients, getCustomEntryNutrients } from '../utils/nutrients';
import { nutrients } from '../data/rda';

interface Props {
  entries: FoodEntry[];
  onUpdateAmount: (id: string, grams: number) => void;
  onUpdateEntry: (id: string, updates: Partial<FoodEntry>) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  onAddPlaceholder: () => void;
  foodMacroOverrides: FoodMacroOverrides;
  onFoodMacroOverridesChange: (overrides: FoodMacroOverrides) => void;
}

function formatValue(val: number): string {
  if (val >= 100) return Math.round(val).toString();
  if (val >= 10) return val.toFixed(1);
  return val.toFixed(2);
}

const MACRO_FIELDS = [
  { key: 'calories', label: 'Cal', unit: 'kcal' },
  { key: 'protein', label: 'Protein', unit: 'g' },
  { key: 'carbs', label: 'Carbs', unit: 'g' },
  { key: 'fat', label: 'Fat', unit: 'g' },
] as const;

function PlaceholderRow({ entry, onUpdateAmount, onUpdateEntry, onRemove }: {
  entry: FoodEntry;
  onUpdateAmount: (id: string, grams: number) => void;
  onUpdateEntry: (id: string, updates: Partial<FoodEntry>) => void;
  onRemove: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const scaled = getCustomEntryNutrients(entry);

  const vitamins = nutrients.filter(n => n.category === 'vitamin');
  const minerals = nutrients.filter(n => n.category === 'mineral');

  function updateMacro(key: string, value: number) {
    onUpdateEntry(entry.id, {
      customMacros: { ...entry.customMacros, [key]: value },
    });
  }

  function updateMicro(key: string, value: number) {
    onUpdateEntry(entry.id, {
      customMicros: { ...entry.customMicros, [key]: value },
    });
  }

  return (
    <>
      <tr className="border-b border-gray-700 hover:bg-gray-700/30">
        <td className="py-2 px-3 text-sm">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-gray-500 hover:text-blue-400 transition-colors"
            >
              <span className={`text-[10px] transition-transform inline-block ${expanded ? 'rotate-90' : ''}`}>▶</span>
            </button>
            <input
              type="text"
              value={entry.foodName}
              onChange={e => onUpdateEntry(entry.id, { foodName: e.target.value })}
              className="bg-transparent border-b border-dashed border-gray-600 text-gray-200 text-sm px-0.5 py-0 focus:outline-none focus:border-blue-400 w-full"
              placeholder="Food name..."
            />
          </div>
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
            className="w-full px-2 py-1 bg-gray-900 border border-gray-600 rounded text-sm text-right text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </td>
        {MACRO_FIELDS.map(f => (
          <td key={f.key} className="py-2 px-3">
            <input
              type="number"
              min="0"
              step="0.1"
              value={entry.customMacros?.[f.key as keyof Macros] || ''}
              onChange={e => {
                const val = parseFloat(e.target.value);
                updateMacro(f.key, isNaN(val) ? 0 : Math.max(0, val));
              }}
              className="w-16 px-1.5 py-0.5 bg-gray-900 border border-gray-600 rounded text-xs text-right text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </td>
        ))}
        <td className="py-2 px-2 w-20">
          <button
            onClick={() => onRemove(entry.id)}
            className="text-gray-500 hover:text-red-400 transition-colors p-1"
            aria-label="Remove food"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
            </svg>
          </button>
        </td>
      </tr>
      {expanded && (
        <tr className="border-b border-gray-700">
          <td colSpan={7} className="px-3 py-2 bg-gray-700/30">
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 ml-5">
              <div>
                <div className="text-[11px] text-gray-500 uppercase tracking-wide mb-1">Vitamins (per 100g)</div>
                <div className="space-y-0.5">
                  {vitamins.map(n => {
                    const val = entry.customMicros?.[n.key as keyof Micros] ?? 0;
                    return (
                      <div key={n.key} className="flex items-center gap-2 text-xs">
                        <span className="w-20 text-gray-400 shrink-0">{n.label}</span>
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          value={val || ''}
                          onChange={e => {
                            const v = parseFloat(e.target.value);
                            updateMicro(n.key, isNaN(v) ? 0 : Math.max(0, v));
                          }}
                          className="w-16 px-1 py-0 bg-gray-900 border border-gray-600 rounded text-xs text-right text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <span className="text-gray-500 text-[10px]">{n.unit}</span>
                        <span className="text-gray-500 tabular-nums ml-auto">
                          {formatValue(scaled[n.key] || 0)} scaled
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-gray-500 uppercase tracking-wide mb-1">Minerals (per 100g)</div>
                <div className="space-y-0.5">
                  {minerals.map(n => {
                    const val = entry.customMicros?.[n.key as keyof Micros] ?? 0;
                    return (
                      <div key={n.key} className="flex items-center gap-2 text-xs">
                        <span className="w-20 text-gray-400 shrink-0">{n.label}</span>
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          value={val || ''}
                          onChange={e => {
                            const v = parseFloat(e.target.value);
                            updateMicro(n.key, isNaN(v) ? 0 : Math.max(0, v));
                          }}
                          className="w-16 px-1 py-0 bg-gray-900 border border-gray-600 rounded text-xs text-right text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <span className="text-gray-500 text-[10px]">{n.unit}</span>
                        <span className="text-gray-500 tabular-nums ml-auto">
                          {formatValue(scaled[n.key] || 0)} scaled
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

function FoodRow({ entry, onUpdateAmount, onUpdateEntry, onRemove, food, override, onSaveOverride, onResetOverride }: {
  entry: FoodEntry;
  onUpdateAmount: (id: string, grams: number) => void;
  onUpdateEntry: (id: string, updates: Partial<FoodEntry>) => void;
  onRemove: (id: string) => void;
  food: FoodItem | null;
  override: FoodMacroOverride | undefined;
  onSaveOverride: (values: FoodMacroOverride) => void;
  onResetOverride: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editingMacros, setEditingMacros] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [editValues, setEditValues] = useState<FoodMacroOverride>({});
  const scaled = food ? getScaledNutrients(food, entry.amountGrams, food && override ? { [food.id]: override } : undefined) : null;

  const vitamins = nutrients.filter(n => n.category === 'vitamin');
  const minerals = nutrients.filter(n => n.category === 'mineral');

  const hasOverride = override && Object.keys(override).length > 0;

  function startEditing() {
    const scale = entry.amountGrams / 100;
    const initial: FoodMacroOverride = {};
    for (const f of MACRO_FIELDS) {
      if (override && f.key in override) {
        initial[f.key as keyof FoodMacroOverride] = override[f.key as keyof FoodMacroOverride];
      } else if (food) {
        initial[f.key as keyof FoodMacroOverride] = Math.round(food.macros[f.key as keyof typeof food.macros] * scale * 10) / 10;
      }
    }
    setEditValues(initial);
    setEditingMacros(true);
  }

  function saveEditing() {
    const scale = entry.amountGrams / 100;
    const per100g: FoodMacroOverride = {};
    for (const f of MACRO_FIELDS) {
      const val = editValues[f.key as keyof FoodMacroOverride] ?? 0;
      per100g[f.key as keyof FoodMacroOverride] = scale > 0 ? Math.round((val / scale) * 100) / 100 : 0;
    }
    onSaveOverride(per100g);
    setEditingMacros(false);
  }

  function cancelEditing() {
    setEditingMacros(false);
  }

  return (
    <>
      <tr className="border-b border-gray-700 hover:bg-gray-700/30">
        <td className="py-2 px-3 text-sm text-gray-200">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-gray-500 hover:text-blue-400 transition-colors"
            >
              <span className={`text-[10px] transition-transform inline-block ${expanded ? 'rotate-90' : ''}`}>▶</span>
            </button>
            {editingName ? (
              <input
                type="text"
                value={entry.foodName}
                onChange={e => onUpdateEntry(entry.id, { foodName: e.target.value })}
                onBlur={() => setEditingName(false)}
                onKeyDown={e => { if (e.key === 'Enter') setEditingName(false); }}
                autoFocus
                className="bg-transparent border-b border-dashed border-gray-600 text-gray-200 text-sm px-0.5 py-0 focus:outline-none focus:border-blue-400 w-full"
              />
            ) : (
              <span
                onDoubleClick={() => setEditingName(true)}
                className="cursor-text hover:text-blue-400 transition-colors"
                title="Double-click to rename"
              >
                {entry.foodName}
              </span>
            )}
          </div>
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
            className="w-full px-2 py-1 bg-gray-900 border border-gray-600 rounded text-sm text-right text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </td>
        {MACRO_FIELDS.map(f => (
          <td key={f.key} className="py-2 px-3 text-right text-sm tabular-nums">
            {editingMacros && food ? (
              <input
                type="number"
                min="0"
                step="0.1"
                value={editValues[f.key as keyof FoodMacroOverride] ?? ''}
                onChange={e => {
                  const val = parseFloat(e.target.value);
                  setEditValues(prev => ({ ...prev, [f.key]: isNaN(val) ? 0 : Math.max(0, val) }));
                }}
                className="w-16 px-1.5 py-0.5 bg-gray-900 border border-gray-600 rounded text-xs text-right text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            ) : (
              <span className={`${hasOverride && override && f.key in override ? 'text-blue-300' : 'text-gray-300'}`}>
                {scaled ? (f.key === 'calories' ? Math.round(scaled[f.key]) : scaled[f.key]?.toFixed(1)) : '—'}
              </span>
            )}
          </td>
        ))}
        <td className="py-2 px-2 w-24">
          <div className="flex items-center gap-0.5">
            {food && !editingMacros && (
              <button
                onClick={startEditing}
                className="p-1 text-gray-500 hover:text-gray-300 transition-colors"
                aria-label="Edit macros"
                title="Edit macros"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                  <path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
                  <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
                </svg>
              </button>
            )}
            {editingMacros && (
              <>
                <button
                  onClick={saveEditing}
                  className="px-1.5 py-0.5 text-[10px] font-medium bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={cancelEditing}
                  className="px-1.5 py-0.5 text-[10px] font-medium text-gray-400 hover:text-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </>
            )}
            {hasOverride && !editingMacros && (
              <button
                onClick={onResetOverride}
                className="p-1 text-gray-500 hover:text-yellow-400 transition-colors"
                aria-label="Reset macros to default"
                title="Reset to original"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                  <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.312-.311h2.433a.75.75 0 0 0 0-1.5H4.598a.75.75 0 0 0-.75.75v3.634a.75.75 0 0 0 1.5 0v-2.033l.312.311a7 7 0 0 0 11.712-3.138.75.75 0 0 0-1.449-.39Zm1.06-7.057a.75.75 0 0 0-1.5 0v2.033l-.312-.312a7 7 0 0 0-11.712 3.139.75.75 0 0 0 1.449.39 5.5 5.5 0 0 1 9.201-2.467l.312.312H11.58a.75.75 0 1 0 0 1.5h3.634a.75.75 0 0 0 .75-.75V4.367Z" clipRule="evenodd" />
                </svg>
              </button>
            )}
            {!editingMacros && (
              <button
                onClick={() => onRemove(entry.id)}
                className="text-gray-500 hover:text-red-400 transition-colors p-1"
                aria-label="Remove food"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
        </td>
      </tr>
      {expanded && scaled && (
        <tr className="border-b border-gray-700">
          <td colSpan={7} className="px-3 py-2 bg-gray-700/30">
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 ml-5">
              <div>
                <div className="text-[11px] text-gray-500 uppercase tracking-wide mb-1">Vitamins</div>
                <div className="space-y-0.5">
                  {vitamins.map(n => {
                    const val = scaled[n.key] || 0;
                    const pct = (val / n.rda) * 100;
                    return (
                      <div key={n.key} className="flex items-center gap-2 text-xs">
                        <span className="w-20 text-gray-400 shrink-0">{n.label}</span>
                        <div className="flex-1 h-1.5 bg-gray-600 rounded-full overflow-hidden">
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
                <div className="text-[11px] text-gray-500 uppercase tracking-wide mb-1">Minerals</div>
                <div className="space-y-0.5">
                  {minerals.map(n => {
                    const val = scaled[n.key] || 0;
                    const pct = (val / n.rda) * 100;
                    return (
                      <div key={n.key} className="flex items-center gap-2 text-xs">
                        <span className="w-20 text-gray-400 shrink-0">{n.label}</span>
                        <div className="flex-1 h-1.5 bg-gray-600 rounded-full overflow-hidden">
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

export function FoodLog({ entries, onUpdateAmount, onUpdateEntry, onRemove, onClear, onAddPlaceholder, foodMacroOverrides, onFoodMacroOverridesChange }: Props) {
  function handleSaveOverride(foodId: string, values: FoodMacroOverride) {
    onFoodMacroOverridesChange({
      ...foodMacroOverrides,
      [foodId]: values,
    });
  }

  function handleResetOverride(foodId: string) {
    const next = { ...foodMacroOverrides };
    delete next[foodId];
    onFoodMacroOverridesChange(next);
  }

  return (
    <div className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <h2 className="text-lg font-semibold text-gray-100">Food Log</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={onAddPlaceholder}
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors px-2 py-1"
          >
            + Custom
          </button>
          {entries.length > 0 && (
            <button
              onClick={onClear}
              className="text-sm text-gray-500 hover:text-red-400 transition-colors px-2 py-1"
            >
              Clear All
            </button>
          )}
        </div>
      </div>
      {entries.length === 0 ? (
        <div className="py-12 text-center text-gray-500">
          <p className="text-sm">No foods added yet.</p>
          <p className="text-xs mt-1">Use the search above to add foods, or add a custom entry.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-700/30 text-xs font-medium text-gray-400 uppercase tracking-wider">
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
              {entries.map(entry => {
                if (!entry.foodId) {
                  return (
                    <PlaceholderRow
                      key={entry.id}
                      entry={entry}
                      onUpdateAmount={onUpdateAmount}
                      onUpdateEntry={onUpdateEntry}
                      onRemove={onRemove}
                    />
                  );
                }
                const food = getFoodById(entry.foodId);
                return (
                  <FoodRow
                    key={entry.id}
                    entry={entry}
                    onUpdateAmount={onUpdateAmount}
                    onUpdateEntry={onUpdateEntry}
                    onRemove={onRemove}
                    food={food ?? null}
                    override={food ? foodMacroOverrides[food.id] : undefined}
                    onSaveOverride={(values) => food && handleSaveOverride(food.id, values)}
                    onResetOverride={() => food && handleResetOverride(food.id)}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
