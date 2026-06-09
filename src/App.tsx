import { FoodSearch } from './components/FoodSearch';
import { FoodLog } from './components/FoodLog';
import { NutrientSummary } from './components/NutrientSummary';
import { useLocalStorage } from './hooks/useLocalStorage';
import { computeTotals } from './utils/nutrients';
import type { FoodEntry, FoodItem } from './types';

function App() {
  const [entries, setEntries] = useLocalStorage<FoodEntry[]>('nutrient-calc-entries', []);

  const totals = computeTotals(entries);

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
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Nutrient Calculator</h1>
          <p className="text-sm text-gray-500 mt-1">Track your daily macro and micronutrient intake</p>
        </header>

        <FoodSearch onAdd={addFood} />

        <FoodLog
          entries={entries}
          onUpdateAmount={updateAmount}
          onRemove={removeEntry}
          onClear={clearAll}
        />

        <NutrientSummary totals={totals} />

      </div>
    </div>
  );
}

export default App;
