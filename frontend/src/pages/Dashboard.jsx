import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import DailyProgress from '../components/DailyProgress';
import WeeklyChart from '../components/WeeklyChart';
import MealCard from '../components/MealCard';

export default function Dashboard() {
  const { user } = useAuth();
  const location = useLocation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    try {
      const { data: d } = await api.get('/meals/dashboard');
      setData(d);
    } catch (err) {
      setError('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [location.key]);

  const handleDelete = (id) => {
    setData((prev) => ({
      ...prev,
      dailyMeals: prev.dailyMeals.filter((m) => m._id !== id),
      dailyTotal: prev.dailyTotal - (prev.dailyMeals.find((m) => m._id === id)?.calories || 0),
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500">{error}</p>
        <button onClick={fetchDashboard} className="btn-primary mt-4">Retry</button>
      </div>
    );
  }

  const todayStr = new Date().toLocaleDateString('en', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Hello, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">{todayStr}</p>
        </div>
        <Link to="/add-meal" className="btn-primary text-sm hidden md:inline-flex">
          + Log Meal
        </Link>
      </div>

      <DailyProgress consumed={data.dailyTotal} goal={data.calorieGoal} />

      <WeeklyChart data={data.weeklyData} goal={data.calorieGoal} />

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-700 dark:text-gray-200">Today's Meals</h2>
          <span className="text-sm text-gray-400 dark:text-gray-500">{data.dailyMeals.length} logged</span>
        </div>

        {data.dailyMeals.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-4xl mb-3">🍽️</p>
            <p className="text-gray-500 dark:text-gray-400 font-medium">No meals logged today</p>
            <Link to="/add-meal" className="btn-primary inline-block mt-4 text-sm">
              Log your first meal
            </Link>
          </div>
        ) : (
          <div>
            {data.dailyMeals.map((meal) => (
              <MealCard key={meal._id} meal={meal} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
