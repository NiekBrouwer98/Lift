import { useState } from 'react';
import {
  ResponsiveContainer, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import { formatDate } from '../exercises.js';

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="chart-tooltip">
      <div className="ct-val">{d.oneRM.toFixed(1)} kg</div>
      <div className="ct-date">{formatDate(d.date)}</div>
      <div className="ct-date">{d.weightKg} kg × {d.reps} reps</div>
    </div>
  );
}

export default function ProgressChart({ exercises, workouts }) {
  const [selected, setSelected] = useState(exercises[0].name);

  const data = workouts
    .filter(w => w.exercise === selected)
    .sort((a, b) => a.date.localeCompare(b.date));

  const oneRMs  = data.map(d => d.oneRM);
  const best    = oneRMs.length ? Math.max(...oneRMs) : null;
  const latest  = oneRMs.length ? oneRMs[oneRMs.length - 1] : null;
  const delta   = oneRMs.length >= 2 ? oneRMs[oneRMs.length - 1] - oneRMs[0] : null;

  const chartData = data.map(w => ({
    ...w,
    label: new Date(w.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
  }));

  return (
    <div className="page">
      <div className="nav-bar"><h1>Progress</h1></div>

      {/* Exercise pills */}
      <div className="pills">
        {exercises.map(ex => (
          <button
            key={ex.name}
            className={`pill ${selected === ex.name ? 'active' : ''}`}
            onClick={() => setSelected(ex.name)}
          >
            {ex.emoji} {ex.name}
          </button>
        ))}
      </div>

      {data.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">📈</div>
          <p>No {selected} data yet.<br/>Log some sets to see your progress.</p>
        </div>
      ) : (
        <div className="section">
          {/* Chart */}
          <div className="card" style={{ padding: '16px 8px 8px' }}>
            <p style={{ paddingLeft: 12, marginBottom: 8, fontSize: '0.8rem', color: 'var(--label3)' }}>
              Estimated 1RM (kg) over time
            </p>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData} margin={{ top: 4, right: 16, left: -8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: 'var(--label3)' }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 11, fill: 'var(--label3)' }}
                  tickLine={false}
                  axisLine={false}
                  domain={['auto', 'auto']}
                  tickFormatter={v => `${v}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="oneRM"
                  stroke="#007AFF"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#007AFF', strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Stats */}
          <div className="stats-row">
            <div className="stat-card">
              <div className="s-val" style={{ color: '#FF9500' }}>
                {best ? best.toFixed(1) : '—'} kg
              </div>
              <div className="s-lbl">Best 1RM</div>
            </div>
            <div className="stat-card">
              <div className="s-val" style={{ color: 'var(--blue)' }}>
                {latest ? latest.toFixed(1) : '—'} kg
              </div>
              <div className="s-lbl">Latest 1RM</div>
            </div>
            <div className="stat-card">
              <div className="s-val" style={{ color: 'var(--green)' }}>
                {data.length}
              </div>
              <div className="s-lbl">Sessions</div>
            </div>
          </div>

          {/* Total improvement */}
          {delta !== null && (
            <div className="delta-banner">
              <span className="delta-icon">{delta >= 0 ? '📈' : '📉'}</span>
              <div>
                <div
                  className="delta-val"
                  style={{ color: delta >= 0 ? 'var(--green)' : 'var(--red)' }}
                >
                  {delta >= 0 ? '+' : ''}{delta.toFixed(1)} kg
                </div>
                <div className="delta-lbl">total change since first session</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
