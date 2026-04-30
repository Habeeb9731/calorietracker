export default function DailyProgress({ consumed, goal }) {
  const pct = Math.min(100, Math.round((consumed / goal) * 100));
  const remaining = Math.max(0, goal - consumed);
  const over = consumed > goal;

  const barColor = over
    ? 'bg-red-400'
    : pct > 80
    ? 'bg-yellow-400'
    : 'bg-primary-500';

  return (
    <div className="card">
      <div className="flex justify-between items-baseline mb-3">
        <h2 className="font-semibold text-gray-700">Today's Progress</h2>
        <span className="text-xs text-gray-400">Goal: {goal} kcal</span>
      </div>

      <div className="flex items-end gap-4 mb-4">
        <div>
          <p className="text-4xl font-bold text-gray-900">{consumed}</p>
          <p className="text-sm text-gray-500">kcal consumed</p>
        </div>
        <div className="ml-auto text-right">
          {over ? (
            <p className="text-red-500 font-semibold text-lg">{consumed - goal} over</p>
          ) : (
            <p className="text-primary-600 font-semibold text-lg">{remaining} left</p>
          )}
        </div>
      </div>

      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className="text-xs text-gray-400 mt-1.5 text-right">{pct}% of daily goal</p>
    </div>
  );
}
