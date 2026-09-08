import { useState } from 'react';
import ActiveWorkout from './ActiveWorkout.jsx';

export default function Workouts({ exercises, workouts: logs, workoutPlans, onSavePlan, onDeletePlan, onAddWorkout }) {
  const [creating,    setCreating]    = useState(false);
  const [planName,    setPlanName]    = useState('');
  const [picked,      setPicked]      = useState([]);   // ordered list of exercise names
  const [searchEx,    setSearchEx]    = useState('');
  const [activePlan,  setActivePlan]  = useState(null);

  const filteredEx = exercises.filter(e =>
    e.name.toLowerCase().includes(searchEx.toLowerCase()) && !picked.includes(e.name)
  );

  function addToPlan(name) {
    setPicked(p => [...p, name]);
    setSearchEx('');
  }

  function removeFromPlan(name) {
    setPicked(p => p.filter(n => n !== name));
  }

  function savePlan() {
    const name = planName.trim();
    if (!name || picked.length === 0) return;
    onSavePlan({ id: crypto.randomUUID(), name, exercises: picked });
    setPlanName('');
    setPicked([]);
    setCreating(false);
  }

  if (activePlan) {
    return (
      <ActiveWorkout
        plan={activePlan}
        exercises={exercises}
        logs={logs}
        onLog={onAddWorkout}
        onFinish={() => setActivePlan(null)}
      />
    );
  }

  if (creating) {
    return (
      <div className="page">
        <div className="nav-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button className="nav-text-btn" onClick={() => { setCreating(false); setPlanName(''); setPicked([]); }}>Cancel</button>
          <h1>New Workout</h1>
          <button className="nav-text-btn primary" onClick={savePlan} disabled={!planName.trim() || picked.length === 0}>Save</button>
        </div>

        <div className="section">
          {/* Name */}
          <p className="section-label">Name</p>
          <div className="card">
            <div className="form-row">
              <input
                type="text"
                placeholder="e.g. Push Day"
                value={planName}
                onChange={e => setPlanName(e.target.value)}
                style={{ flex: 1, border: 'none', outline: 'none', fontSize: '1rem', background: 'transparent' }}
              />
            </div>
          </div>

          {/* Selected exercises */}
          {picked.length > 0 && (
            <>
              <p className="section-label">Exercises ({picked.length})</p>
              <div className="card">
                {picked.map((name, i) => {
                  const ex = exercises.find(e => e.name === name);
                  return (
                    <div key={name} className="history-item">
                      <span className="ex-icon">{ex?.emoji ?? '💪'}</span>
                      <div style={{ flex: 1 }}>
                        <div className="ex-name">{name}</div>
                        <div className="ex-sub">#{i + 1}</div>
                      </div>
                      <button className="del-btn" onClick={() => removeFromPlan(name)}>✕</button>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Add exercises */}
          <p className="section-label">Add Exercises</p>
          <div className="ex-search-wrap">
            <div className="ex-search-row">
              <span style={{ fontSize: '1rem' }}>🔍</span>
              <input
                className="ex-search-input"
                type="text"
                placeholder="Search…"
                value={searchEx}
                onChange={e => setSearchEx(e.target.value)}
              />
              {searchEx && <button className="ex-search-clear" onClick={() => setSearchEx('')}>✕</button>}
            </div>
          </div>
          <div className="card">
            {filteredEx.length === 0
              ? <div style={{ padding: '14px 16px', color: 'var(--label3)', fontSize: '0.9rem' }}>No exercises found</div>
              : filteredEx.map(ex => (
                  <button key={ex.name} className="ex-drop-item" style={{ border: 'none', width: '100%', cursor: 'pointer' }} onClick={() => addToPlan(ex.name)}>
                    <span className="ex-drop-emoji">{ex.emoji}</span>
                    <span>{ex.name}</span>
                    <span style={{ marginLeft: 'auto', color: 'var(--blue)', fontSize: '1.2rem' }}>＋</span>
                  </button>
                ))
            }
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="nav-bar"><h1>Workouts</h1></div>

      {workoutPlans.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">📋</div>
          <p>No workout plans yet.<br/>Create one to get started.</p>
        </div>
      ) : (
        <div className="section">
          <div className="card">
            {workoutPlans.map(plan => (
              <div key={plan.id} className="plan-item">
                <div style={{ flex: 1, minWidth: 0 }} onClick={() => setActivePlan(plan)}>
                  <div className="plan-name">{plan.name}</div>
                  <div className="plan-sub">
                    {plan.exercises.map(n => exercises.find(e => e.name === n)?.emoji ?? '💪').join(' ')}
                    {' · '}{plan.exercises.length} exercise{plan.exercises.length !== 1 ? 's' : ''}
                  </div>
                </div>
                <button className="plan-start-btn" onClick={() => setActivePlan(plan)}>Start</button>
                <button className="del-btn" onClick={() => onDeletePlan(plan.id)}>✕</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ padding: '8px 16px 24px' }}>
        <button className="btn-primary" onClick={() => setCreating(true)}>＋ New Workout Plan</button>
      </div>
    </div>
  );
}
