import { useState, useRef, useEffect, useCallback } from 'react';
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
  const [usdaPage, setUsdaPage] = useState(0);
  const [usdaTotalPages, setUsdaTotalPages] = useState(0);
  const [showUsda, setShowUsda] = useState(false);
  const [usdaError, setUsdaError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const interactingRef = useRef(false);

  const localResults = searchFoods(query);
  const displayResults = showUsda ? usdaResults : localResults;
  const showDropdown = isOpen && query.length >= 2 && !selectedFood;
  const hasMorePages = showUsda && usdaPage < usdaTotalPages;

  const showSearchUsdaAction = !showUsda && !usdaLoading;
  const showLoadMoreAction = hasMorePages && !usdaLoading;
  const actionIndex = showSearchUsdaAction || showLoadMoreAction ? displayResults.length : -1;
  const maxIndex = actionIndex >= 0 ? actionIndex : displayResults.length - 1;

  useEffect(() => {
    setActiveIndex(-1);
    setShowUsda(false);
    setUsdaResults([]);
    setUsdaPage(0);
    setUsdaTotalPages(0);
    setUsdaError(null);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (interactingRef.current) return;
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (showDropdown) {
      document.documentElement.classList.add('dropdown-open');
    } else {
      document.documentElement.classList.remove('dropdown-open');
    }
    return () => { document.documentElement.classList.remove('dropdown-open'); };
  }, [showDropdown]);

  const handleDropdownMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    interactingRef.current = true;
    requestAnimationFrame(() => { interactingRef.current = false; });
  }, []);

  async function handleSearchUsda(page = 1) {
    if (query.length < 2) return;
    setUsdaLoading(true);
    setShowUsda(true);
    setIsOpen(true);
    setActiveIndex(-1);
    setUsdaError(null);
    try {
      const result = await searchUsda(query, page);
      if (page === 1) {
        setUsdaResults(result.foods);
      } else {
        setUsdaResults(prev => [...prev, ...result.foods]);
      }
      setUsdaPage(result.currentPage);
      setUsdaTotalPages(result.totalPages);
    } catch (e) {
      const msg = e instanceof Error ? e.message : '';
      if (msg === 'RATE_LIMITED') {
        setUsdaError('Rate limited by USDA API. Please wait a moment and try again.');
      } else {
        setUsdaError('USDA search failed. Please try again.');
      }
      if (page === 1) setUsdaResults([]);
    } finally {
      setUsdaLoading(false);
      setIsOpen(true);
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
    if (!showDropdown) {
      if (e.key === 'Enter' && selectedFood) {
        e.preventDefault();
        handleAdd();
      }
      return;
    }

    if (e.key === 'Escape') {
      setIsOpen(false);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => (i < maxIndex ? i + 1 : i));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => (i > 0 ? i - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < displayResults.length) {
        handleSelect(displayResults[activeIndex]);
      } else if (activeIndex === actionIndex) {
        if (showSearchUsdaAction) {
          handleSearchUsda();
        } else if (showLoadMoreAction) {
          handleSearchUsda(usdaPage + 1);
        }
      }
    }
  }

  const isActionActive = activeIndex === actionIndex;

  return (
    <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-4">
      <h2 className="text-lg font-semibold text-gray-100 mb-3">Add Food</h2>
      <div className="flex items-end gap-3">
        <div ref={containerRef} className="relative flex-1">
          <label className="block text-xs font-medium text-gray-400 mb-1">Food</label>
          <input
            type="text"
            value={query}
            onChange={e => handleQueryChange(e.target.value)}
            onFocus={() => { if (!selectedFood) setIsOpen(true); }}
            onKeyDown={handleKeyDown}
            placeholder="Search food..."
            className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            role="combobox"
            aria-expanded={showDropdown}
            aria-activedescendant={activeIndex >= 0 ? `food-option-${activeIndex}` : undefined}
          />
          {showDropdown && (
            <div
              className="absolute z-50 mt-1 w-full max-h-72 overflow-auto bg-gray-800 border border-gray-600 rounded-md shadow-lg"
              onMouseDown={handleDropdownMouseDown}
            >
              {displayResults.length > 0 && (
                <ul role="listbox">
                  {displayResults.map((food, i) => (
                    <li
                      key={food.id}
                      id={`food-option-${i}`}
                      role="option"
                      aria-selected={i === activeIndex}
                      onClick={() => handleSelect(food)}
                      onMouseEnter={() => setActiveIndex(i)}
                      className={`px-3 py-2 text-sm cursor-pointer ${
                        i === activeIndex ? 'bg-blue-900/50 text-blue-200' : 'text-gray-200 hover:bg-gray-700'
                      }`}
                    >
                      <span className="font-medium">{food.name}</span>
                      <span className="ml-2 text-xs text-gray-500">{food.category}</span>
                    </li>
                  ))}
                </ul>
              )}
              {showSearchUsdaAction && (
                <div
                  className={`border-t border-gray-700 px-3 py-2 cursor-pointer ${isActionActive ? 'bg-blue-900/50' : 'hover:bg-gray-700'}`}
                  onClick={() => handleSearchUsda()}
                  onMouseEnter={() => setActiveIndex(actionIndex)}
                >
                  <span className={`text-sm font-medium ${isActionActive ? 'text-blue-300' : 'text-blue-400'}`}>
                    Search USDA database...
                  </span>
                </div>
              )}
              {usdaLoading && (
                <div className="border-t border-gray-700 px-3 py-3 flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-blue-400" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span className="text-sm text-gray-400">Searching USDA database...</span>
                </div>
              )}
              {usdaError && (
                <div className="border-t border-gray-700 px-3 py-2">
                  <p className="text-sm text-yellow-400">{usdaError}</p>
                </div>
              )}
              {showUsda && !usdaLoading && !usdaError && usdaResults.length === 0 && (
                <div className="border-t border-gray-700 px-3 py-2">
                  <p className="text-sm text-gray-400">No results found in USDA database.</p>
                </div>
              )}
              {showLoadMoreAction && (
                <div
                  className={`border-t border-gray-700 px-3 py-2 cursor-pointer ${isActionActive ? 'bg-blue-900/50' : 'hover:bg-gray-700'}`}
                  onClick={() => handleSearchUsda(usdaPage + 1)}
                  onMouseEnter={() => setActiveIndex(actionIndex)}
                >
                  <span className={`group inline-flex items-center gap-1.5 text-sm font-medium ${isActionActive ? 'text-blue-300' : 'text-blue-400'}`}>
                    Load more results
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="w-24">
          <label className="block text-xs font-medium text-gray-400 mb-1">Grams</label>
          <input
            type="number"
            min="0"
            value={grams || ''}
            onChange={e => setGrams(Math.max(0, parseFloat(e.target.value) || 0))}
            onKeyDown={handleKeyDown}
            className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-sm text-right text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={handleAdd}
          disabled={!selectedFood}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-colors"
        >
          Add
        </button>
      </div>
      {selectedFood && (
        <p className="mt-2 text-xs text-green-400">
          Ready to add: {selectedFood.name} ({grams}g)
        </p>
      )}
    </div>
  );
}
