import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { useTheme } from '../context/ThemeContext';

const formatDay = (dateStr) => {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en', { weekday: 'short' });
};

const CustomTooltip = ({ active, payload, label, dark }) => {
  if (active && payload?.length) {
    return (
      <div className={`border shadow-lg rounded-xl px-3 py-2 text-sm ${
        dark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-100'
      }`}>
        <p className={dark ? 'text-gray-400' : 'text-gray-500'}>{label}</p>
        <p className={`font-bold ${dark ? 'text-gray-100' : 'text-gray-900'}`}>{payload[0].value} kcal</p>
      </div>
    );
  }
  return null;
};

export default function WeeklyChart({ data, goal }) {
  const { dark } = useTheme();
  const formatted = data.map((d) => ({ ...d, day: formatDay(d.date) }));

  const gridColor = dark ? '#374151' : '#f3f4f6';
  const tickColor = dark ? '#6b7280' : '#9ca3af';
  const cursorColor = dark ? '#374151' : '#f9fafb';

  return (
    <div className="card">
      <h2 className="font-semibold text-gray-700 dark:text-gray-200 mb-4">Weekly Summary</h2>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={formatted} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey="day" tick={{ fontSize: 12, fill: tickColor }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: tickColor }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip dark={dark} />} cursor={{ fill: cursorColor }} />
          {goal && (
            <ReferenceLine y={goal} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Goal', fontSize: 11, fill: '#f59e0b' }} />
          )}
          <Bar dataKey="calories" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
