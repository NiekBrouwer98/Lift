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
