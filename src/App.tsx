import { FoodSearch } from './components/FoodSearch';
import { FoodLog } from './components/FoodLog';
import { NutrientSummary } from './components/NutrientSummary';
import { UserProfileSection } from './components/UserProfileSection';
import { useLocalStorage } from './hooks/useLocalStorage';
import { computeTotals } from './utils/nutrients';
import { exportNutrientSnapshot } from './utils/export';
import { getProfileMacroDefaults } from './data/rda';
import type { FoodEntry, FoodItem, MacroTargets, FoodMacroOverrides, UserProfile } from './types';

const DEFAULT_MACRO_TARGETS: MacroTargets = {
  calories: 2000,
  protein: 50,
  carbs: 275,
  fat: 78,
  fiber: 28,
};

function App() {
  const [entries, setEntries] = useLocalStorage<FoodEntry[]>('nutrient-calc-entries', []);
  const [macroTargets, setMacroTargets] = useLocalStorage<MacroTargets>('nutrient-calc-macro-targets', DEFAULT_MACRO_TARGETS);
  const [foodMacroOverrides, setFoodMacroOverrides] = useLocalStorage<FoodMacroOverrides>('nutrient-calc-food-overrides', {});
  const [userProfile, setUserProfile] = useLocalStorage<UserProfile | null>('nutrient-calc-profile', null);
  const [useImperial, setUseImperial] = useLocalStorage<boolean>('nutrient-calc-imperial', false);

  const defaultMacroTargets = userProfile ? getProfileMacroDefaults(userProfile) : DEFAULT_MACRO_TARGETS;

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

  function addPlaceholder() {
    setEntries(prev => [...prev, {
      id: crypto.randomUUID(),
      foodId: null,
      foodName: 'Custom food',
      amountGrams: 100,
      customMacros: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
      customMicros: {},
    }]);
  }

  function updateEntry(id: string, updates: Partial<FoodEntry>) {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  }

  function clearAll() {
    setEntries([]);
  }

  return (
    <div className="min-h-screen bg-[#0f1117] py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="text-center relative">
          <h1 className="text-2xl font-bold text-gray-100">Nutrient Calculator</h1>
          <p className="text-sm text-gray-400 mt-1">Track your daily macro and micronutrient intake</p>
          <button
            onClick={() => exportNutrientSnapshot(totals, macroTargets, entries, foodMacroOverrides)}
            className="absolute right-0 top-1/2 -translate-y-1/2 text-sm text-blue-400 hover:text-blue-300 transition-colors px-3 py-1.5 border border-gray-700 rounded-md hover:border-gray-600"
          >
            Export CSV
          </button>
        </header>

        <UserProfileSection
          profile={userProfile}
          onProfileChange={(p) => {
            setUserProfile(p);
            if (p) setMacroTargets(getProfileMacroDefaults(p));
          }}
          useImperial={useImperial}
          onUseImperialChange={setUseImperial}
        />

        <FoodSearch onAdd={addFood} />

        <FoodLog
          entries={entries}
          onUpdateAmount={updateAmount}
          onUpdateEntry={updateEntry}
          onRemove={removeEntry}
          onClear={clearAll}
          onAddPlaceholder={addPlaceholder}
          foodMacroOverrides={foodMacroOverrides}
          onFoodMacroOverridesChange={setFoodMacroOverrides}
        />

        <NutrientSummary totals={totals} macroTargets={macroTargets} defaultMacroTargets={defaultMacroTargets} onMacroTargetsChange={setMacroTargets} userProfile={userProfile} />

      </div>
    </div>
  );
}

export default App;
