import { useState, useRef } from 'react';
import { epley1RM } from '../exercises.js';

const today = () => new Date().toISOString().split('T')[0];

export default function LogWorkout({ exercises, onAdd, onAddExercise }) {
  const [exercise, setExercise]     = useState(exercises[0].name);
  const [weight,   setWeight]       = useState('');
  const [reps,     setReps]         = useState(5);
  const [date,     setDate]         = useState(today());
  const [toast,    setToast]        = useState(null);
  const [adding,   setAdding]       = useState(false);
  const [newName,  setNewName]      = useState('');
  const newNameRef                  = useRef(null);

  const weightNum = parseFloat(weight) || 0;
  const oneRM     = weightNum > 0 ? epley1RM(weightNum, reps) : null;

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  }

  function handleSave() {
    if (!weightNum || weightNum <= 0) { showToast('Enter a weight first'); return; }
    onAdd({
      id:         crypto.randomUUID(),
      exercise,
      weightKg:   weightNum,
      reps,
      date,
      oneRM:      epley1RM(weightNum, reps),
    });
    showToast(`${exercise} logged ✓`);
  }

  function handleAddExercise() {
    const trimmed = newName.trim();
    if (!trimmed) return;
    if (exercises.some(e => e.name.toLowerCase() === trimmed.toLowerCase())) {
      showToast('Exercise already exists');
      return;
    }
    onAddExercise(trimmed);
    setExercise(trimmed);
    setNewName('');
    setAdding(false);
    showToast(`${trimmed} added ✓`);
  }

  function openAdding() {
    setAdding(true);
    setTimeout(() => newNameRef.current?.focus(), 50);
  }

  return (
    <div className="page">
      <div className="nav-bar"><h1>Log Workout</h1></div>

      <div className="section">
        {/* ── Exercise ── */}
        <p className="section-label">Exercise</p>
        <div className="card">
          <div className="form-row">
            <label>Exercise</label>
            <select value={exercise} onChange={e => setExercise(e.target.value)}>
              {exercises.map(ex => (
                <option key={ex.name} value={ex.name}>{ex.emoji} {ex.name}</option>
              ))}
            </select>
          </div>

          {/* Add exercise row */}
          {adding ? (
            <div className="form-row" style={{ gap: 6 }}>
              <input
                ref={newNameRef}
                type="text"
                placeholder="Exercise name"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAddExercise(); if (e.key === 'Escape') setAdding(false); }}
                style={{ flex: 1, border: 'none', outline: 'none', fontSize: '1rem', background: 'transparent' }}
              />
              <button
                onClick={handleAddExercise}
                style={{ border: 'none', background: 'var(--blue)', color: '#fff', borderRadius: 8, padding: '5px 12px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}
              >
                Add
              </button>
              <button
                onClick={() => { setAdding(false); setNewName(''); }}
                style={{ border: 'none', background: 'var(--blue-light)', color: 'var(--blue)', borderRadius: 8, padding: '5px 10px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={openAdding}
              style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', border: 'none', background: 'none', padding: '12px 16px', fontSize: '0.95rem', color: 'var(--blue)', fontWeight: 500, cursor: 'pointer', borderTop: '1px solid var(--separator)' }}
            >
              <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>＋</span> Add exercise
            </button>
          )}
        </div>

        {/* ── Set details ── */}
        <p className="section-label">Set Details</p>
        <div className="card">
          <div className="form-row">
            <label>Weight</label>
            <input
              type="number"
              inputMode="decimal"
              placeholder="0"
              min="0"
              step="0.5"
              value={weight}
              onChange={e => setWeight(e.target.value)}
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

          <div className="form-row">
            <label>Date</label>
            <input
              type="date"
              value={date}
              max={today()}
              onChange={e => setDate(e.target.value)}
            />
          </div>
        </div>

        {/* ── 1RM preview ── */}
        <p className="section-label">Progress Score</p>
        <div className="one-rm-box">
          <span className="value">{oneRM ? oneRM.toFixed(1) : '—'}</span>
          <span className="unit">kg</span>
          <span className="desc">
            Estimated<br/>1-rep max<br/>(Epley formula)
          </span>
        </div>

        {/* ── Save ── */}
        <button className="btn-primary" onClick={handleSave}>
          Log Set
        </button>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
