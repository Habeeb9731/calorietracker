import api from '../services/api';

const formatTime = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' });
};

export default function MealCard({ meal, onDelete }) {
  const handleDelete = async () => {
    if (!confirm(`Delete "${meal.title}"?`)) return;
    try {
      await api.delete(`/meals/${meal._id}`);
      onDelete(meal._id);
    } catch (err) {
      alert('Failed to delete meal');
    }
  };

  return (
    <div className="flex items-center gap-4 py-3 border-b border-gray-50 dark:border-gray-700 last:border-0 group">
      <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center flex-shrink-0 text-lg">
        {meal.aiDetected ? '🤖' : '🍽️'}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{meal.title}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500">{formatTime(meal.date)}</p>
        {(meal.protein != null || meal.carbs != null || meal.fat != null) && (
          <div className="flex gap-2 mt-1">
            {meal.protein != null && (
              <span className="text-xs text-blue-500 font-medium">P {meal.protein}g</span>
            )}
            {meal.carbs != null && (
              <span className="text-xs text-yellow-500 font-medium">C {meal.carbs}g</span>
            )}
            {meal.fat != null && (
              <span className="text-xs text-red-400 font-medium">F {meal.fat}g</span>
            )}
          </div>
        )}
      </div>

      <div className="text-right flex-shrink-0">
        <p className="font-bold text-gray-900 dark:text-gray-100">{meal.calories}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500">kcal</p>
      </div>

      <button
        onClick={handleDelete}
        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600
                   transition-all duration-150 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
        title="Delete meal"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
}
