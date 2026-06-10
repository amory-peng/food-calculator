import { nutrients } from '../data/rda';
import { getFoodById } from './search';
import { getScaledNutrients, getCustomEntryNutrients } from './nutrients';
import type { NutrientTotals, MacroTargets, FoodEntry, FoodMacroOverrides } from '../types';

function getStatus(percentage: number): string {
  if (percentage >= 80) return 'OK';
  if (percentage >= 50) return 'LOW';
  return 'DEFICIENT';
}

function formatVal(val: number): string {
  if (val >= 100) return Math.round(val).toString();
  if (val >= 10) return val.toFixed(1);
  return val.toFixed(2);
}

function escapeCSV(val: string): string {
  if (val.includes(',') || val.includes('"')) return `"${val.replace(/"/g, '""')}"`;
  return val;
}

export function exportNutrientSnapshot(totals: NutrientTotals, macroTargets: MacroTargets, entries: FoodEntry[], foodMacroOverrides: FoodMacroOverrides) {
  const date = new Date().toLocaleDateString();

  const lines: string[] = [];
  lines.push('Nutrient Snapshot');
  lines.push(`Date: ${date}`);
  lines.push('');

  lines.push('FOOD LOG');
  lines.push('Food,Amount (g),Calories,Protein (g),Carbs (g),Fat (g)');
  for (const entry of entries) {
    let scaled: NutrientTotals | null = null;
    if (entry.foodId) {
      const food = getFoodById(entry.foodId);
      if (food) scaled = getScaledNutrients(food, entry.amountGrams, foodMacroOverrides);
    } else {
      scaled = getCustomEntryNutrients(entry);
    }
    if (scaled) {
      lines.push(`${escapeCSV(entry.foodName)},${entry.amountGrams},${formatVal(scaled.calories)},${formatVal(scaled.protein)},${formatVal(scaled.carbs)},${formatVal(scaled.fat)}`);
    }
  }
  lines.push('');

  lines.push('MACRONUTRIENTS');
  lines.push('Nutrient,Current,Target,Unit,Percentage,Status');

  const macroRows = [
    { key: 'calories', label: 'Calories', unit: 'kcal', target: macroTargets.calories },
    { key: 'protein', label: 'Protein', unit: 'g', target: macroTargets.protein },
    { key: 'carbs', label: 'Carbs', unit: 'g', target: macroTargets.carbs },
    { key: 'fat', label: 'Fat', unit: 'g', target: macroTargets.fat },
    { key: 'fiber', label: 'Fiber', unit: 'g', target: macroTargets.fiber },
  ];

  for (const row of macroRows) {
    const current = totals[row.key] || 0;
    const pct = Math.round((current / row.target) * 100);
    lines.push(`${escapeCSV(row.label)},${formatVal(current)},${row.target},${row.unit},${pct}%,${getStatus(pct)}`);
  }

  lines.push('');
  lines.push('VITAMINS');
  lines.push('Nutrient,Current,RDA,Unit,Percentage,Status');

  const vitamins = nutrients.filter(n => n.category === 'vitamin');
  for (const n of vitamins) {
    const current = totals[n.key] || 0;
    const pct = Math.round((current / n.rda) * 100);
    lines.push(`${escapeCSV(n.label)},${formatVal(current)},${n.rda},${n.unit},${pct}%,${getStatus(pct)}`);
  }

  lines.push('');
  lines.push('MINERALS');
  lines.push('Nutrient,Current,RDA,Unit,Percentage,Status');

  const minerals = nutrients.filter(n => n.category === 'mineral');
  for (const n of minerals) {
    const current = totals[n.key] || 0;
    const pct = Math.round((current / n.rda) * 100);
    lines.push(`${escapeCSV(n.label)},${formatVal(current)},${n.rda},${n.unit},${pct}%,${getStatus(pct)}`);
  }

  const csv = lines.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `nutrient-snapshot-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
