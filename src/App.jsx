import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  loadWorkouts, saveWorkouts, loadCustomExercises, saveCustomExercises, loadPlans, savePlans,
  loadDeleted, saveDeleted, loadSyncCode, saveSyncCode, mergeData,
} from './utils/storage.js';
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
  const [deleted,         setDeleted]         = useState(() => loadDeleted());
  const [syncCode,        setSyncCode]        = useState(() => loadSyncCode());
  const [syncStatus,      setSyncStatus]      = useState('');

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

  const markDeleted = useCallback((id) => {
    setDeleted(prev => {
      const next = [...prev, id];
      saveDeleted(next);
      return next;
    });
  }, []);

  const deleteWorkout = useCallback((id) => {
    setWorkouts(prev => {
      const next = prev.filter(w => w.id !== id);
      saveWorkouts(next);
      return next;
    });
    markDeleted(id);
  }, [markDeleted]);

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
    markDeleted(id);
  }, [markDeleted]);

  /* ── Sync ── */
  const local      = { workouts, customExercises, plans, deleted };
  const dataRef    = useRef(local);
  dataRef.current  = local;
  const lastSynced = useRef('');

  const sync = useCallback(async () => {
    if (!syncCode) return;
    const url = `/api/sync?code=${encodeURIComponent(syncCode)}`;
    try {
      setSyncStatus('Syncing…');
      const r = await fetch(url);
      if (!r.ok) throw new Error();
      const merged = mergeData(dataRef.current, await r.json());
      const body   = JSON.stringify(merged);
      const put    = await fetch(url, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body });
      if (!put.ok) throw new Error();
      lastSynced.current = body;

      // Re-merge with current state so anything logged mid-request isn't overwritten
      const final = mergeData(dataRef.current, merged);
      saveWorkouts(final.workouts);               setWorkouts(final.workouts);
      savePlans(final.plans);                     setPlans(final.plans);
      saveCustomExercises(final.customExercises); setCustomExercises(final.customExercises);
      saveDeleted(final.deleted);                 setDeleted(final.deleted);
      setSyncStatus(`Synced at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
    } catch {
      setSyncStatus('Sync failed — will retry');
    }
  }, [syncCode]);

  useEffect(() => {
    if (!syncCode) return;
    if (JSON.stringify(mergeData(local, {})) === lastSynced.current) return;
    const t = setTimeout(sync, 800);
    return () => clearTimeout(t);
  }, [workouts, customExercises, plans, deleted, syncCode, sync]);

  useEffect(() => {
    const onVisible = () => { if (document.visibilityState === 'visible') sync(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [sync]);

  const changeSyncCode = useCallback((code) => {
    saveSyncCode(code);
    lastSynced.current = '';
    setSyncStatus('');
    setSyncCode(code);
  }, []);

  return (
    <>
      {tab === 'log'      && <LogWorkout exercises={allExercises} onAdd={addWorkout} onAddExercise={addCustomExercise} />}
      {tab === 'workouts' && <Workouts exercises={allExercises} workouts={workouts} workoutPlans={plans} onSavePlan={savePlan} onDeletePlan={deletePlan} onAddWorkout={addWorkout} />}
      {tab === 'progress' && <ProgressChart exercises={allExercises} workouts={workouts} />}
      {tab === 'history'  && (
        <History
          exercises={allExercises} workouts={workouts} onDelete={deleteWorkout} onImport={handleImport}
          syncCode={syncCode} syncStatus={syncStatus} onSetSyncCode={changeSyncCode} onSyncNow={sync}
        />
      )}
      <TabBar active={tab} onChange={setTab} />
    </>
  );
}
