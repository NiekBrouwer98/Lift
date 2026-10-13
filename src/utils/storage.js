const KEY          = 'lift_v1';
const EXERCISES_KEY = 'lift_exercises_v1';

export function loadWorkouts() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveWorkouts(workouts) {
  localStorage.setItem(KEY, JSON.stringify(workouts));
}

export function loadCustomExercises(pickEmoji) {
  try {
    const stored = JSON.parse(localStorage.getItem(EXERCISES_KEY) || '[]');
    if (!pickEmoji) return stored;
    // Migrate any exercises still using the old default emoji
    const migrated = stored.map((ex, i) =>
      ex.emoji === '🏅' ? { ...ex, emoji: pickEmoji(i) } : ex
    );
    if (migrated.some((ex, i) => ex.emoji !== stored[i].emoji)) {
      localStorage.setItem(EXERCISES_KEY, JSON.stringify(migrated));
    }
    return migrated;
  } catch {
    return [];
  }
}

export function saveCustomExercises(exercises) {
  localStorage.setItem(EXERCISES_KEY, JSON.stringify(exercises));
}

const PLANS_KEY = 'lift_plans_v1';

export function loadPlans() {
  try { return JSON.parse(localStorage.getItem(PLANS_KEY) || '[]'); }
  catch { return []; }
}

export function savePlans(plans) {
  localStorage.setItem(PLANS_KEY, JSON.stringify(plans));
}

const DELETED_KEY = 'lift_deleted_v1';
const SYNC_KEY    = 'lift_sync_code';

export function loadDeleted() {
  try { return JSON.parse(localStorage.getItem(DELETED_KEY) || '[]'); }
  catch { return []; }
}

export function saveDeleted(ids) {
  localStorage.setItem(DELETED_KEY, JSON.stringify(ids));
}

export function loadSyncCode() {
  return localStorage.getItem(SYNC_KEY) || '';
}

export function saveSyncCode(code) {
  if (code) localStorage.setItem(SYNC_KEY, code);
  else localStorage.removeItem(SYNC_KEY);
}

// Records are immutable once created, so union-by-key never loses data; tombstones carry deletions.
export function mergeData(a, b) {
  const deleted = [...new Set([...(a.deleted ?? []), ...(b.deleted ?? [])])];
  const gone    = new Set(deleted);
  const union   = (x = [], y = [], key) => [...new Map([...x, ...y].map(r => [r[key], r])).values()];
  return {
    workouts:        union(a.workouts, b.workouts, 'id').filter(w => !gone.has(w.id)),
    plans:           union(a.plans, b.plans, 'id').filter(p => !gone.has(p.id)),
    customExercises: union(a.customExercises, b.customExercises, 'name'),
    deleted,
  };
}

/* ── Export ── */
export function exportData(workouts, customExercises) {
  const payload = JSON.stringify(
    { version: 1, exportedAt: new Date().toISOString(), workouts, customExercises },
    null, 2
  );
  const blob = new Blob([payload], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  const date = new Date().toISOString().split('T')[0];
  a.href     = url;
  a.download = `lift-backup-${date}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ── Import ── */
export function importData(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (!Array.isArray(data.workouts)) throw new Error('Invalid file');
        resolve({
          workouts:        data.workouts        ?? [],
          customExercises: data.customExercises ?? [],
        });
      } catch {
        reject(new Error('Could not read file. Make sure it is a valid Lift backup.'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsText(file);
  });
}
