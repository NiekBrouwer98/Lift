import { useRef, useState } from 'react';
import { formatDate } from '../exercises.js';
import { exportData, importData } from '../utils/storage.js';

export default function History({ exercises, workouts, onDelete, onImport }) {
  const emojiMap  = Object.fromEntries(exercises.map(e => [e.name, e.emoji]));
  const sorted    = [...workouts].sort((a, b) => b.date.localeCompare(a.date));
  const fileInput = useRef(null);
  const [toast, setToast] = useState(null);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  function handleExport() {
    const customExercises = exercises.filter(e => !['Deadlift','Bench Press','Squat','Overhead Press','Barbell Row','Pull-up'].includes(e.name));
    exportData(workouts, customExercises);
  }

  async function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = '';            // reset so same file can be re-imported
    try {
      const data = await importData(file);
      onImport(data);
      showToast(`✓ Imported ${data.workouts.length} workouts`);
    } catch (err) {
      showToast(`⚠ ${err.message}`);
    }
  }

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
                <button className="del-btn" onClick={() => onDelete(w.id)} aria-label="Delete">✕</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Data management ── */}
      <div className="section" style={{ paddingTop: sorted.length === 0 ? 0 : 4 }}>
        <p className="section-label">Data</p>
        <div className="data-actions">
          <button className="data-btn export-btn" onClick={handleExport}>
            <span className="data-btn-icon">📤</span>
            <span className="data-btn-label">Export</span>
            <span className="data-btn-sub">Download backup</span>
          </button>
          <button className="data-btn import-btn" onClick={() => fileInput.current.click()}>
            <span className="data-btn-icon">📥</span>
            <span className="data-btn-label">Import</span>
            <span className="data-btn-sub">Restore backup</span>
          </button>
        </div>
        <input
          ref={fileInput}
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
