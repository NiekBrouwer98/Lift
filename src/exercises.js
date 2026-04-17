export const EXERCISES = [
  { name: 'Deadlift',       emoji: '🏋️' },
  { name: 'Bench Press',    emoji: '💪' },
  { name: 'Squat',          emoji: '🦵' },
  { name: 'Overhead Press', emoji: '🙌' },
  { name: 'Barbell Row',    emoji: '🔄' },
  { name: 'Pull-up',        emoji: '⬆️' },
];

export function epley1RM(weightKg, reps) {
  return weightKg * (1 + reps / 30);
}

export function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}
