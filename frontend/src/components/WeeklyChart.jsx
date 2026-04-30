import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';

const formatDay = (dateStr) => {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en', { weekday: 'short' });
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-gray-100 shadow-lg rounded-xl px-3 py-2 text-sm">
        <p className="text-gray-500">{label}</p>
        <p className="font-bold text-gray-900">{payload[0].value} kcal</p>
      </div>
    );
  }
  return null;
};

export default function WeeklyChart({ data, goal }) {
  const formatted = data.map((d) => ({
    ...d,
    day: formatDay(d.date),
  }));

  return (
    <div className="card">
      <h2 className="font-semibold text-gray-700 mb-4">Weekly Summary</h2>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={formatted} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f9fafb' }} />
          {goal && (
            <ReferenceLine y={goal} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Goal', fontSize: 11, fill: '#f59e0b' }} />
          )}
          <Bar dataKey="calories" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
