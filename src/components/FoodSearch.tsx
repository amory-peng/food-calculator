import { useState, useRef, useEffect } from 'react';
import { searchFoods } from '../utils/search';
import { searchUsda } from '../utils/usda';
import { saveCustomFood } from '../utils/customFoods';
import type { FoodItem } from '../types';

interface Props {
  onAdd: (food: FoodItem, grams: number) => void;
}

export function FoodSearch({ onAdd }: Props) {
  const [query, setQuery] = useState('');
  const [grams, setGrams] = useState(100);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [usdaResults, setUsdaResults] = useState<FoodItem[]>([]);
  const [usdaLoading, setUsdaLoading] = useState(false);
  const [showUsda, setShowUsda] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const localResults = searchFoods(query);
  const displayResults = showUsda ? usdaResults : localResults;
  const showDropdown = isOpen && (displayResults.length > 0 || usdaLoading) && !selectedFood;

  useEffect(() => {
    setActiveIndex(-1);
    setShowUsda(false);
    setUsdaResults([]);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleSearchUsda() {
    if (query.length < 2) return;
    setUsdaLoading(true);
    setShowUsda(true);
    try {
      const results = await searchUsda(query);
      setUsdaResults(results);
    } catch (e) {
      console.error('USDA search failed:', e);
      setUsdaResults([]);
    } finally {
      setUsdaLoading(false);
    }
  }

  function handleSelect(food: FoodItem) {
    if (showUsda) {
      saveCustomFood(food);
    }
    setSelectedFood(food);
    setQuery(food.name);
    setIsOpen(false);
    setShowUsda(false);
  }

  function handleAdd() {
    if (!selectedFood) return;
    onAdd(selectedFood, grams);
    setQuery('');
    setSelectedFood(null);
    setGrams(100);
  }

  function handleQueryChange(text: string) {
    setQuery(text);
    setSelectedFood(null);
    setIsOpen(true);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (showDropdown) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex(i => Math.min(i + 1, displayResults.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex(i => Math.max(i - 1, 0));
      } else if (e.key === 'Enter' && activeIndex >= 0) {
        e.preventDefault();
        handleSelect(displayResults[activeIndex]);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    } else if (e.key === 'Enter' && selectedFood) {
      e.preventDefault();
      handleAdd();
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h2 className="text-lg font-semibold text-gray-800 mb-3">Add Food</h2>
      <div className="flex items-end gap-3">
        <div ref={containerRef} className="relative flex-1">
          <label className="block text-xs font-medium text-gray-500 mb-1">Food</label>
          <input
            type="text"
            value={query}
            onChange={e => handleQueryChange(e.target.value)}
            onFocus={() => { if (!selectedFood) setIsOpen(true); }}
            onKeyDown={handleKeyDown}
            placeholder="Search food..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            role="combobox"
            aria-expanded={showDropdown}
            aria-activedescendant={activeIndex >= 0 ? `food-option-${activeIndex}` : undefined}
          />
          {showDropdown && (
            <ul
              role="listbox"
              className="absolute z-50 mt-1 w-full max-h-60 overflow-auto bg-white border border-gray-200 rounded-md shadow-lg"
            >
              {usdaLoading && (
                <li className="px-3 py-2 text-sm text-gray-400">Searching USDA...</li>
              )}
              {displayResults.map((food, i) => (
                <li
                  key={food.id}
                  id={`food-option-${i}`}
                  role="option"
                  aria-selected={i === activeIndex}
                  onMouseDown={() => handleSelect(food)}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={`px-3 py-2 text-sm cursor-pointer ${
                    i === activeIndex ? 'bg-blue-50 text-blue-900' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="font-medium">{food.name}</span>
                  <span className="ml-2 text-xs text-gray-400">{food.category}</span>
                </li>
              ))}
            </ul>
          )}
          {isOpen && !selectedFood && localResults.length === 0 && query.length >= 2 && !showUsda && (
            <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg p-3">
              <p className="text-sm text-gray-500 mb-2">No local results for "{query}"</p>
              <button
                onMouseDown={handleSearchUsda}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Search USDA database...
              </button>
            </div>
          )}
          {showUsda && !usdaLoading && usdaResults.length === 0 && (
            <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg p-3">
              <p className="text-sm text-gray-500">No results found in USDA database.</p>
            </div>
          )}
        </div>
        <div className="w-24">
          <label className="block text-xs font-medium text-gray-500 mb-1">Grams</label>
          <input
            type="number"
            min="0"
            value={grams || ''}
            onChange={e => setGrams(Math.max(0, parseFloat(e.target.value) || 0))}
            onKeyDown={handleKeyDown}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <button
          onClick={handleAdd}
          disabled={!selectedFood}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-colors"
        >
          Add
        </button>
      </div>
      {selectedFood && (
        <p className="mt-2 text-xs text-green-600">
          Ready to add: {selectedFood.name} ({grams}g)
        </p>
      )}
    </div>
  );
}
