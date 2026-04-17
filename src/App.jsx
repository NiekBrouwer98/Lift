import { useState, useCallback, useMemo } from 'react';
import { loadWorkouts, saveWorkouts, loadCustomExercises, saveCustomExercises } from './utils/storage.js';
import { EXERCISES } from './exercises.js';
import LogWorkout from './components/LogWorkout.jsx';
import ProgressChart from './components/ProgressChart.jsx';
import History from './components/History.jsx';
import TabBar from './components/TabBar.jsx';

export default function App() {
  const [tab, setTab] = useState('log');
  const [workouts, setWorkouts] = useState(() => loadWorkouts());
  const [customExercises, setCustomExercises] = useState(() => loadCustomExercises());

  const allExercises = useMemo(
    () => [...EXERCISES, ...customExercises],
    [customExercises]
  );

  const addWorkout = useCallback((entry) => {
    setWorkouts(prev => {
      const next = [...prev, entry];
      saveWorkouts(next);
      return next;
    });
  }, []);

  const deleteWorkout = useCallback((id) => {
    setWorkouts(prev => {
      const next = prev.filter(w => w.id !== id);
      saveWorkouts(next);
      return next;
    });
  }, []);

  const addCustomExercise = useCallback((name) => {
    const entry = { name, emoji: '🏅' };
    setCustomExercises(prev => {
      const next = [...prev, entry];
      saveCustomExercises(next);
      return next;
    });
    return entry;
  }, []);

  return (
    <>
      {tab === 'log'      && <LogWorkout exercises={allExercises} onAdd={addWorkout} onAddExercise={addCustomExercise} />}
      {tab === 'progress' && <ProgressChart exercises={allExercises} workouts={workouts} />}
      {tab === 'history'  && <History exercises={allExercises} workouts={workouts} onDelete={deleteWorkout} />}
      <TabBar active={tab} onChange={setTab} />
    </>
  );
}
