export const EXERCISES = [
  { name: 'Deadlift',       emoji: '🏋️' },
  { name: 'Bench Press',    emoji: '💪' },
  { name: 'Squat',          emoji: '🦵' },
  { name: 'Overhead Press', emoji: '🙌' },
  { name: 'Barbell Row',    emoji: '🔄' },
  { name: 'Pull-up',        emoji: '⬆️' },
];

const CUSTOM_EMOJIS = [
  '🔥','⚡','🎯','🏆','🥊','🤸','🧗','🚴','🏊','🤾',
  '🥋','🎽','🏇','🤼','🛹','🪃','🧘','🤺','🏄','🎿',
];

export function pickEmoji(index) {
  return CUSTOM_EMOJIS[index % CUSTOM_EMOJIS.length];
}

export function epley1RM(weightKg, reps) {
  if (reps === 1) return weightKg;
  return weightKg * (1 + reps / 30);
}

export function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}
