import { useEffect, useState } from 'react';
import api from '../services/api';
import MealCard from '../components/MealCard';

const toDateInput = (date) => date.toISOString().split('T')[0];

export default function MealHistory() {
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(toDateInput(weekAgo));
  const [endDate, setEndDate] = useState(toDateInput(today));
  const [error, setError] = useState('');

  const fetchMeals = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/meals', {
        params: { startDate, endDate, limit: 100 },
      });
      setMeals(data.meals);
    } catch {
      setError('Failed to load meal history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeals();
  }, [startDate, endDate]);

  const handleDelete = (id) => setMeals((prev) => prev.filter((m) => m._id !== id));

  // Group meals by date
  const grouped = meals.reduce((acc, meal) => {
    const key = new Date(meal.date).toLocaleDateString('en', {
      weekday: 'long', month: 'short', day: 'numeric',
    });
    if (!acc[key]) acc[key] = [];
    acc[key].push(meal);
    return acc;
  }, {});

  const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Meal History</h1>
        {meals.length > 0 && (
          <span className="text-sm text-gray-500">
            {meals.length} meals · {totalCalories} kcal total
          </span>
        )}
      </div>

      {/* Date range filter */}
      <div className="card flex gap-3 items-end flex-wrap">
        <div className="flex-1 min-w-[140px]">
          <label className="block text-xs font-medium text-gray-500 mb-1">From</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="input-field"
          />
        </div>
        <div className="flex-1 min-w-[140px]">
          <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="input-field"
          />
        </div>
        <button onClick={fetchMeals} className="btn-primary text-sm">
          Filter
        </button>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : meals.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-gray-500 font-medium">No meals in this date range</p>
        </div>
      ) : (
        Object.entries(grouped).map(([date, dayMeals]) => {
          const dayTotal = dayMeals.reduce((s, m) => s + m.calories, 0);
          return (
            <div key={date} className="card">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-gray-800">{date}</h3>
                <span className="text-sm font-medium text-primary-600">{dayTotal} kcal</span>
              </div>
              {dayMeals.map((meal) => (
                <MealCard key={meal._id} meal={meal} onDelete={handleDelete} />
              ))}
            </div>
          );
        })
      )}
    </div>
  );
}
