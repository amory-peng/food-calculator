import { FoodSearch } from './components/FoodSearch';
import { FoodLog } from './components/FoodLog';
import { NutrientSummary } from './components/NutrientSummary';
import { useLocalStorage } from './hooks/useLocalStorage';
import { computeTotals } from './utils/nutrients';
import type { FoodEntry, FoodItem, MacroTargets, FoodMacroOverrides } from './types';

const DEFAULT_MACRO_TARGETS: MacroTargets = {
  protein: 50,
  carbs: 275,
  fat: 78,
  fiber: 28,
};

function App() {
  const [entries, setEntries] = useLocalStorage<FoodEntry[]>('nutrient-calc-entries', []);
  const [macroTargets, setMacroTargets] = useLocalStorage<MacroTargets>('nutrient-calc-macro-targets', DEFAULT_MACRO_TARGETS);
  const [foodMacroOverrides, setFoodMacroOverrides] = useLocalStorage<FoodMacroOverrides>('nutrient-calc-food-overrides', {});

  const totals = computeTotals(entries, foodMacroOverrides);

  function addFood(food: FoodItem, grams: number) {
    setEntries(prev => [...prev, {
      id: crypto.randomUUID(),
      foodId: food.id,
      foodName: food.name,
      amountGrams: grams,
    }]);
  }

  function updateAmount(id: string, grams: number) {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, amountGrams: grams } : e));
  }

  function removeEntry(id: string) {
    setEntries(prev => prev.filter(e => e.id !== id));
  }

  function clearAll() {
    setEntries([]);
  }

  return (
    <div className="min-h-screen bg-[#0f1117] py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="text-center">
          <h1 className="text-2xl font-bold text-gray-100">Nutrient Calculator</h1>
          <p className="text-sm text-gray-400 mt-1">Track your daily macro and micronutrient intake</p>
        </header>

        <FoodSearch onAdd={addFood} />

        <FoodLog
          entries={entries}
          onUpdateAmount={updateAmount}
          onRemove={removeEntry}
          onClear={clearAll}
          foodMacroOverrides={foodMacroOverrides}
          onFoodMacroOverridesChange={setFoodMacroOverrides}
        />

        <NutrientSummary totals={totals} macroTargets={macroTargets} defaultMacroTargets={DEFAULT_MACRO_TARGETS} onMacroTargetsChange={setMacroTargets} />

      </div>
    </div>
  );
}

export default App;
