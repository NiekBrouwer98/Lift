import { useState } from 'react';
import { epley1RM } from '../exercises.js';

const today = () => new Date().toISOString().split('T')[0];

export default function ActiveWorkout({ plan, exercises, logs, onLog, onFinish }) {
  const [step,    setStep]    = useState(0);
  const [weight,  setWeight]  = useState('');
  const [reps,    setReps]    = useState(5);
  const [date]                = useState(today());
  const [logged,  setLogged]  = useState([]);   // {name, oneRM} for summary
  const [done,    setDone]    = useState(false);

  const total       = plan.exercises.length;
  const exerciseName = plan.exercises[step];
  const exMeta      = exercises.find(e => e.name === exerciseName);

  // Latest logged 1RM for this exercise
  const prevEntries = logs
    .filter(w => w.exercise === exerciseName)
    .sort((a, b) => b.date.localeCompare(a.date));
  const lastEntry = prevEntries[0] ?? null;

  const weightNum = parseFloat(weight) || 0;
  const oneRM     = weightNum > 0 ? epley1RM(weightNum, reps) : null;

  function advance(loggedEntry) {
    if (loggedEntry) setLogged(l => [...l, loggedEntry]);
    if (step + 1 >= total) {
      setDone(true);
    } else {
      setStep(s => s + 1);
      setWeight('');
      setReps(5);
    }
  }

  function handleLog() {
    if (!weightNum || weightNum <= 0) return;
    const entry = {
      id: crypto.randomUUID(), exercise: exerciseName,
      weightKg: weightNum, reps, date, oneRM: epley1RM(weightNum, reps),
    };
    onLog(entry);
    advance({ name: exerciseName, emoji: exMeta?.emoji ?? '💪', oneRM: entry.oneRM });
  }

  function handleSkip() {
    advance(null);
  }

  if (done) {
    return (
      <div className="page">
        <div className="nav-bar"><h1>Workout Done 🎉</h1></div>
        <div className="section">
          <div className="done-banner">
            <div style={{ fontSize: '3rem', marginBottom: 8 }}>🏆</div>
            <div className="done-title">{plan.name}</div>
            <div className="done-sub">{logged.length} of {total} exercises logged</div>
          </div>
          {logged.length > 0 && (
            <>
              <p className="section-label">This Session</p>
              <div className="card">
                {logged.map((l, i) => (
                  <div key={i} className="history-item">
                    <span className="ex-icon">{l.emoji}</span>
                    <div style={{ flex: 1 }}><div className="ex-name">{l.name}</div></div>
                    <div className="ex-orm">{l.oneRM.toFixed(1)} kg 1RM</div>
                  </div>
                ))}
              </div>
            </>
          )}
          <button className="btn-primary" onClick={onFinish}>Back to Workouts</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      {/* Header with back + progress */}
      <div className="nav-bar">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <button className="nav-text-btn" onClick={onFinish}>✕ End</button>
          <span style={{ fontSize: '0.9rem', color: 'var(--label3)', fontWeight: 600 }}>
            {step + 1} / {total}
          </span>
        </div>
        <div className="workout-progress-bar">
          <div className="workout-progress-fill" style={{ width: `${((step) / total) * 100}%` }} />
        </div>
      </div>

      <div className="section">
        {/* Exercise header */}
        <div className="active-ex-header">
          <span className="active-ex-emoji">{exMeta?.emoji ?? '💪'}</span>
          <div>
            <div className="active-ex-name">{exerciseName}</div>
            {lastEntry ? (
              <div className="active-ex-prev">Last: {lastEntry.weightKg} kg × {lastEntry.reps} reps · {lastEntry.oneRM.toFixed(1)} kg 1RM</div>
            ) : (
              <div className="active-ex-prev">No previous data</div>
            )}
          </div>
        </div>

        {/* Input */}
        <p className="section-label">This Set</p>
        <div className="card">
          <div className="form-row">
            <label>Weight</label>
            <input
              type="number" inputMode="decimal" placeholder="0" min="0" step="0.5"
              value={weight} onChange={e => setWeight(e.target.value)}
            />
            <span style={{ color: 'var(--label3)', fontSize: '0.95rem' }}>kg</span>
          </div>
          <div className="form-row">
            <label>Reps</label>
            <div className="stepper">
              <button onClick={() => setReps(r => Math.max(1, r - 1))}>−</button>
              <span className="stepper-val">{reps}</span>
              <button onClick={() => setReps(r => Math.min(50, r + 1))}>+</button>
            </div>
          </div>
        </div>

        {/* 1RM preview */}
        {oneRM && (
          <div className="one-rm-box">
            <span className="value">{oneRM.toFixed(1)}</span>
            <span className="unit">kg</span>
            <span className="desc">Estimated<br/>1-rep max</span>
          </div>
        )}

        <button className="btn-primary" onClick={handleLog} disabled={!weightNum || weightNum <= 0}>
          Log & Next →
        </button>
        <button className="btn-secondary" onClick={handleSkip}>
          Skip
        </button>
      </div>
    </div>
  );
}
