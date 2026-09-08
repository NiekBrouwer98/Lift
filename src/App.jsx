import { useState, useCallback, useMemo } from 'react';
import { loadWorkouts, saveWorkouts, loadCustomExercises, saveCustomExercises, loadPlans, savePlans } from './utils/storage.js';
import { EXERCISES, pickEmoji } from './exercises.js';
import LogWorkout from './components/LogWorkout.jsx';
import ProgressChart from './components/ProgressChart.jsx';
import History from './components/History.jsx';
import Workouts from './components/Workouts.jsx';
import TabBar from './components/TabBar.jsx';

export default function App() {
  const [tab,             setTab]             = useState('log');
  const [workouts,        setWorkouts]        = useState(() => loadWorkouts());
  const [customExercises, setCustomExercises] = useState(() => loadCustomExercises(pickEmoji));
  const [plans,           setPlans]           = useState(() => loadPlans());

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
    const entry = { name, emoji: pickEmoji(customExercises.length) };
    setCustomExercises(prev => {
      const next = [...prev, entry];
      saveCustomExercises(next);
      return next;
    });
    return entry;
  }, [customExercises.length]);

  const handleImport = useCallback(({ workouts: w, customExercises: ce }) => {
    saveWorkouts(w);
    saveCustomExercises(ce);
    setWorkouts(w);
    setCustomExercises(ce);
  }, []);

  const savePlan = useCallback((plan) => {
    setPlans(prev => {
      const next = [...prev, plan];
      savePlans(next);
      return next;
    });
  }, []);

  const deletePlan = useCallback((id) => {
    setPlans(prev => {
      const next = prev.filter(p => p.id !== id);
      savePlans(next);
      return next;
    });
  }, []);

  return (
    <>
      {tab === 'log'      && <LogWorkout exercises={allExercises} onAdd={addWorkout} onAddExercise={addCustomExercise} />}
      {tab === 'workouts' && <Workouts exercises={allExercises} workouts={workouts} workoutPlans={plans} onSavePlan={savePlan} onDeletePlan={deletePlan} onAddWorkout={addWorkout} />}
      {tab === 'progress' && <ProgressChart exercises={allExercises} workouts={workouts} />}
      {tab === 'history'  && <History exercises={allExercises} workouts={workouts} onDelete={deleteWorkout} onImport={handleImport} />}
      <TabBar active={tab} onChange={setTab} />
    </>
  );
}
