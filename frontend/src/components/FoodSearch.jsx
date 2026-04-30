import { useState, useEffect, useRef } from 'react';
import api from '../services/api';

export default function FoodSearch({ onSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const timerRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/foods/search?q=${encodeURIComponent(query)}`);
        setResults(data.foods || []);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timerRef.current);
  }, [query]);

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (food) => {
    onSelect(food);
    setQuery('');
    setOpen(false);
    setResults([]);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">🔍</span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search USDA food database..."
          className="input-field pl-9"
          autoComplete="off"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-white rounded-xl shadow-xl border border-gray-100 max-h-72 overflow-y-auto">
          {results.map((food) => (
            <button
              key={food.fdcId}
              type="button"
              onClick={() => handleSelect(food)}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 transition-colors"
            >
              <p className="text-sm font-medium text-gray-900 truncate">{food.name}</p>
              <div className="flex gap-3 mt-0.5">
                <span className="text-xs text-gray-500">{food.calories} kcal</span>
                <span className="text-xs text-blue-500 font-medium">P {food.protein}g</span>
                <span className="text-xs text-yellow-500 font-medium">C {food.carbs}g</span>
                <span className="text-xs text-red-400 font-medium">F {food.fat}g</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {open && !loading && results.length === 0 && query.trim().length >= 2 && (
        <div className="absolute z-50 mt-1 w-full bg-white rounded-xl shadow-lg border border-gray-100 px-4 py-3">
          <p className="text-sm text-gray-500">No results for "{query}"</p>
        </div>
      )}
    </div>
  );
}
