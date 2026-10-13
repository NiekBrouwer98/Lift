import { useRef, useState } from 'react';
import { formatDate } from '../exercises.js';
import { exportData, importData } from '../utils/storage.js';

function SyncCard({ code, status, onSetCode, onSyncNow }) {
  const [input, setInput] = useState('');
  const rowText = { flex: 1, minWidth: 0, fontSize: '0.85rem', color: 'var(--label3)' };

  if (!code) {
    return (
      <div className="card">
        <div className="form-row">
          <input
            type="text"
            placeholder="Paste code from other phone"
            value={input}
            onChange={e => setInput(e.target.value)}
            style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', fontSize: '0.95rem', background: 'transparent' }}
          />
          <button className="plan-start-btn" disabled={!input.trim()} onClick={() => onSetCode(input.trim())}>Join</button>
        </div>
        <button className="ex-drop-add" onClick={() => onSetCode(crypto.randomUUID())}>
          <span>＋</span><span>Create new sync code</span>
        </button>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="form-row">
        <code style={{ ...rowText, color: 'var(--label)', wordBreak: 'break-all', userSelect: 'all' }}>{code}</code>
        <button className="plan-start-btn" onClick={() => navigator.clipboard?.writeText(code)}>Copy</button>
      </div>
      <div className="form-row">
        <span style={rowText}>{status || 'Not synced yet'}</span>
        <button className="nav-text-btn" onClick={onSyncNow}>Sync now</button>
        <button className="nav-text-btn" style={{ color: 'var(--red)' }} onClick={() => onSetCode('')}>Disconnect</button>
      </div>
    </div>
  );
}

export default function History({ exercises, workouts, onDelete, onImport, syncCode, syncStatus, onSetSyncCode, onSyncNow }) {
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
        <p className="section-label">Sync across devices</p>
        <SyncCard code={syncCode} status={syncStatus} onSetCode={onSetSyncCode} onSyncNow={onSyncNow} />

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
