import { formatDate } from '../exercises.js';

export default function History({ exercises, workouts, onDelete }) {
  const emojiMap = Object.fromEntries(exercises.map(e => [e.name, e.emoji]));
  const sorted = [...workouts].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="page">
      <div className="nav-bar"><h1>History</h1></div>

      {sorted.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">🏋️</div>
          <p>No workouts logged yet.<br/>Head to Log to record your first set.</p>
        </div>
      ) : (
        <div className="section">
          <div className="card">
            {sorted.map(w => (
              <div key={w.id} className="history-item">
                <span className="ex-icon">{emojiMap[w.exercise] ?? '💪'}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="ex-name">{w.exercise}</div>
                  <div className="ex-sub">{w.weightKg} kg × {w.reps} reps</div>
                </div>
                <div style={{ textAlign: 'right', marginRight: 4 }}>
                  <div className="ex-orm">{w.oneRM.toFixed(1)} kg</div>
                  <div className="ex-date">{formatDate(w.date)}</div>
                </div>
                <button
                  className="del-btn"
                  onClick={() => onDelete(w.id)}
                  aria-label="Delete"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
