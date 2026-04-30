import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import FoodScanner from '../components/FoodScanner';
import FoodSearch from '../components/FoodSearch';

const now = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default function AddMeal() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('manual'); // 'manual' | 'ai'
  const [form, setForm] = useState({
    title: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    date: now(),
    notes: '',
  });
  const [aiMeta, setAiMeta] = useState(null); // stores AI confidence/description
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFoodSelect = (food) => {
    setForm((prev) => ({
      ...prev,
      title: food.name,
      calories: String(food.calories),
      protein: food.protein ? String(food.protein) : '',
      carbs: food.carbs ? String(food.carbs) : '',
      fat: food.fat ? String(food.fat) : '',
    }));
    setAiMeta(null);
    setTab('manual');
  };

  const handleAiResult = (result) => {
    setForm((prev) => ({
      ...prev,
      title: result.foodName,
      calories: String(result.calories),
      protein: result.protein != null ? String(result.protein) : '',
      carbs: result.carbs != null ? String(result.carbs) : '',
      fat: result.fat != null ? String(result.fat) : '',
    }));
    setAiMeta(result);
    setTab('manual');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.title.trim() || !form.calories) {
      setError('Title and calories are required');
      return;
    }

    setLoading(true);
    try {
      await api.post('/meals', {
        title: form.title,
        calories: Number(form.calories),
        protein: form.protein !== '' ? Number(form.protein) : null,
        carbs: form.carbs !== '' ? Number(form.carbs) : null,
        fat: form.fat !== '' ? Number(form.fat) : null,
        date: form.date,
        notes: form.notes,
        aiDetected: !!aiMeta,
        aiConfidence: aiMeta?.confidence ?? null,
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save meal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Log a Meal</h1>

      {/* Tab switcher */}
      <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1 gap-1">
        {['manual', 'ai'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              tab === t ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            {t === 'manual' ? '✏️ Manual Entry' : '🤖 AI Scan'}
          </button>
        ))}
      </div>

      {tab === 'ai' && (
        <div className="card">
          <h2 className="font-semibold text-gray-700 dark:text-gray-200 mb-4">AI Food Detection</h2>
          <FoodScanner onResult={handleAiResult} />
        </div>
      )}

      {tab === 'manual' && (
        <div className="card">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Search USDA Database
            </label>
            <FoodSearch onSelect={handleFoodSelect} />
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Search 600k+ foods — auto-fills name & macros</p>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-700 my-4" />

          {aiMeta && (
            <div className="bg-primary-50 border border-primary-100 rounded-xl px-4 py-3 mb-4">
              <p className="text-sm font-medium text-primary-700">
                AI detected: {aiMeta.foodName}
              </p>
              {aiMeta.description && (
                <p className="text-xs text-primary-600 mt-0.5">{aiMeta.description}</p>
              )}
              <p className="text-xs text-primary-500 mt-1">
                Confidence: {Math.round(aiMeta.confidence * 100)}% — feel free to edit below
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Meal Name
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g., Chicken Biryani"
                required
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Calories (kcal)
              </label>
              <input
                type="number"
                name="calories"
                value={form.calories}
                onChange={handleChange}
                placeholder="350"
                min={0}
                max={10000}
                required
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Macros <span className="text-gray-400 dark:text-gray-500 font-normal">(grams, optional)</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <input
                    type="number"
                    name="protein"
                    value={form.protein}
                    onChange={handleChange}
                    placeholder="Protein"
                    min={0}
                    max={1000}
                    className="input-field text-center"
                  />
                  <p className="text-xs text-blue-500 text-center mt-1 font-medium">Protein</p>
                </div>
                <div>
                  <input
                    type="number"
                    name="carbs"
                    value={form.carbs}
                    onChange={handleChange}
                    placeholder="Carbs"
                    min={0}
                    max={1000}
                    className="input-field text-center"
                  />
                  <p className="text-xs text-yellow-500 text-center mt-1 font-medium">Carbs</p>
                </div>
                <div>
                  <input
                    type="number"
                    name="fat"
                    value={form.fat}
                    onChange={handleChange}
                    placeholder="Fat"
                    min={0}
                    max={1000}
                    className="input-field text-center"
                  />
                  <p className="text-xs text-red-400 text-center mt-1 font-medium">Fat</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Date & Time
              </label>
              <input
                type="datetime-local"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Notes (optional)
              </label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Any additional notes..."
                rows={2}
                className="input-field resize-none"
              />
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button type="submit" disabled={loading} className="btn-primary flex-1">
                {loading ? 'Saving...' : 'Save Meal'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
