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

export function loadCustomExercises() {
  try {
    return JSON.parse(localStorage.getItem(EXERCISES_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveCustomExercises(exercises) {
  localStorage.setItem(EXERCISES_KEY, JSON.stringify(exercises));
}
