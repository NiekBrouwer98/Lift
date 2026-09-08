import { useState, useRef } from 'react';
import { epley1RM } from '../exercises.js';

const today = () => new Date().toISOString().split('T')[0];

export default function LogWorkout({ exercises, onAdd, onAddExercise }) {
  const [exercise, setExercise] = useState(exercises[0].name);
  const [weight,   setWeight]   = useState('');
  const [reps,     setReps]     = useState(5);
  const [date,     setDate]     = useState(today());
  const [toast,    setToast]    = useState(null);

  const [query,    setQuery]    = useState('');
  const [dropOpen, setDropOpen] = useState(false);
  const inputRef               = useRef(null);

  const weightNum  = parseFloat(weight) || 0;
  const oneRM      = weightNum > 0 ? epley1RM(weightNum, reps) : null;
  const selectedEx = exercises.find(e => e.name === exercise);

  const filtered = exercises.filter(ex =>
    ex.name.toLowerCase().includes(query.toLowerCase())
  );
  const canAdd = query.trim() &&
    !exercises.some(e => e.name.toLowerCase() === query.trim().toLowerCase());

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  }

  function handleSave() {
    if (!weightNum || weightNum <= 0) { showToast('Enter a weight first'); return; }
    onAdd({ id: crypto.randomUUID(), exercise, weightKg: weightNum, reps, date, oneRM: epley1RM(weightNum, reps) });
    showToast(`${exercise} logged ✓`);
  }

  function pick(name) {
    setExercise(name);
    setQuery('');
    setDropOpen(false);
  }

  function handleAddNew() {
    const trimmed = query.trim();
    if (!trimmed) return;
    onAddExercise(trimmed);
    pick(trimmed);
    showToast(`${trimmed} added ✓`);
  }

  function handleBlur() {
    // Small delay so mousedown on dropdown items fires first
    setTimeout(() => setDropOpen(false), 150);
  }

  return (
    <div className="page">
      <div className="nav-bar"><h1>Log Workout</h1></div>

      <div className="section">
        {/* ── Exercise search ── */}
        <p className="section-label">Exercise</p>
        <div className="ex-search-wrap">
          <div className="ex-search-row">
            <span className="ex-search-emoji">{selectedEx?.emoji}</span>
            <input
              ref={inputRef}
              className="ex-search-input"
              type="text"
              placeholder={dropOpen ? 'Search exercises…' : exercise}
              value={query}
              onChange={e => { setQuery(e.target.value); setDropOpen(true); }}
              onFocus={() => setDropOpen(true)}
              onBlur={handleBlur}
            />
            {dropOpen
              ? <button className="ex-search-clear" onMouseDown={() => { setQuery(''); setDropOpen(false); }}>✕</button>
              : <span className="ex-search-chevron">›</span>
            }
          </div>

          {dropOpen && (
            <div className="ex-dropdown">
              {filtered.map(ex => (
                <button
                  key={ex.name}
                  className={`ex-drop-item ${ex.name === exercise ? 'active' : ''}`}
                  onMouseDown={() => pick(ex.name)}
                >
                  <span className="ex-drop-emoji">{ex.emoji}</span>
                  <span>{ex.name}</span>
                  {ex.name === exercise && <span className="ex-drop-check">✓</span>}
                </button>
              ))}
              {canAdd && (
                <button className="ex-drop-add" onMouseDown={handleAddNew}>
                  <span>＋</span>
                  <span>Add "{query.trim()}"</span>
                </button>
              )}
              {filtered.length === 0 && !canAdd && (
                <div className="ex-drop-empty">No exercises found</div>
              )}
            </div>
          )}
        </div>

        {/* ── Set details ── */}
        <p className="section-label">Set Details</p>
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
          <div className="form-row">
            <label>Date</label>
            <input type="date" value={date} max={today()} onChange={e => setDate(e.target.value)} />
          </div>
        </div>

        {/* ── 1RM preview ── */}
        <p className="section-label">Progress Score</p>
        <div className="one-rm-box">
          <span className="value">{oneRM ? oneRM.toFixed(1) : '—'}</span>
          <span className="unit">kg</span>
          <span className="desc">Estimated<br/>1-rep max<br/>(Epley formula)</span>
        </div>

        <button className="btn-primary" onClick={handleSave}>Log Set</button>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
