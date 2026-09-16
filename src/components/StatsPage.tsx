import { useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { toDateKey } from '../utils/date';

export function StatsPage() {
  const { cards, reviewLog } = useStore();

  const reviewedToday = useMemo(
    () => reviewLog.filter((iso) => toDateKey(new Date(iso)) === toDateKey(new Date())).length,
    [reviewLog]
  );

  const streak = useMemo(() => {
    const days = new Set(reviewLog.map((iso) => toDateKey(new Date(iso))));
    let count = 0;
    const cursor = new Date();
    if (!days.has(toDateKey(cursor))) {
      cursor.setDate(cursor.getDate() - 1);
    }
    while (days.has(toDateKey(cursor))) {
      count += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return count;
  }, [reviewLog]);

  const forecast = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const key = toDateKey(d);
      const count = cards.filter((c) => toDateKey(new Date(c.dueDate)) === key).length;
      return { label: i === 0 ? 'Today' : d.toLocaleDateString(undefined, { weekday: 'short' }), count };
    });
  }, [cards]);

  return (
    <div className="p-6 md:p-10">
      <h1 className="mb-8 text-2xl font-semibold">Stats</h1>

      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Current streak" value={`${streak} day${streak === 1 ? '' : 's'}`} icon="🔥" />
        <StatCard label="Reviewed today" value={String(reviewedToday)} icon="✅" />
        <StatCard label="Total cards" value={String(cards.length)} icon="🗂️" />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-6 text-sm font-medium text-slate-500 dark:text-slate-400">
          Due in the next 7 days
        </h2>
        <ForecastChart data={forecast} />
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-2 text-2xl">{icon}</div>
      <div className="text-xl font-semibold">{value}</div>
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
    </div>
  );
}

function ForecastChart({ data }: { data: { label: string; count: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  const barWidth = 32;
  const gap = 20;
  const chartHeight = 140;
  const width = data.length * (barWidth + gap);

  return (
    <svg
      viewBox={`0 0 ${width} ${chartHeight + 40}`}
      className="w-full"
      style={{ maxWidth: width }}
    >
      {data.map((d, i) => {
        const barHeight = (d.count / max) * chartHeight;
        const x = i * (barWidth + gap);
        return (
          <g key={d.label}>
            <rect
              x={x}
              y={chartHeight - barHeight}
              width={barWidth}
              height={Math.max(barHeight, 2)}
              rx={6}
              className="fill-indigo-500"
            />
            <text
              x={x + barWidth / 2}
              y={chartHeight - barHeight - 6}
              textAnchor="middle"
              className="fill-slate-500 text-[10px] dark:fill-slate-400"
            >
              {d.count}
            </text>
            <text
              x={x + barWidth / 2}
              y={chartHeight + 20}
              textAnchor="middle"
              className="fill-slate-500 text-[10px] dark:fill-slate-400"
            >
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
