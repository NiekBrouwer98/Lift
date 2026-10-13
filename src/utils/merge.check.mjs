import assert from 'node:assert';
import { mergeData } from './storage.js';

const phoneA = { workouts: [{ id: 'a1' }, { id: 'x' }], plans: [{ id: 'p1' }], customExercises: [{ name: 'Dips' }], deleted: [] };
const phoneB = { workouts: [{ id: 'b1' }, { id: 'x' }], plans: [], customExercises: [{ name: 'Dips' }, { name: 'Lunge' }], deleted: ['a1'] };
const m = mergeData(phoneA, phoneB);

assert.deepStrictEqual(m.workouts.map(w => w.id), ['x', 'b1']);   // union, deletion respected
assert.deepStrictEqual(m.plans.map(p => p.id), ['p1']);
assert.deepStrictEqual(m.customExercises.map(e => e.name), ['Dips', 'Lunge']);
assert.deepStrictEqual(mergeData(m, m), m);                        // idempotent
assert.deepStrictEqual(mergeData({}, {}).workouts, []);            // empty remote
console.log('merge ok');
