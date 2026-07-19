import assert from 'node:assert/strict';
import { calculateScore, clearReviewedMiss, createInitialState, getAvailableQuestions, getCurrentQuestion, recordMiss } from '../src/gameLogic.js';

const questions = [
  { id: 1, category: 'Definitions' },
  { id: 2, category: 'Section 6' },
  { id: 3, category: 'Definitions' },
];

const state = createInitialState();
assert.equal(state.score, 0);
assert.equal(state.activeCategory, 'All');

assert.deepEqual(getAvailableQuestions(questions, state).map(question => question.id), [1, 2, 3]);
assert.equal(getCurrentQuestion(questions, state).id, 1);

state.usedIds = [1];
state.activeCategory = 'Definitions';
assert.deepEqual(getAvailableQuestions(questions, state).map(question => question.id), [3]);

state.mode = 'review';
state.missedIds = [2, 3];
state.activeCategory = 'All';
assert.deepEqual(getAvailableQuestions(questions, state).map(question => question.id), [2, 3]);

assert.deepEqual(
  calculateScore({ currentScore: 500, currentStreak: 0, questionPoints: 200, wheelValue: 300, isCorrect: true }),
  { score: 1000, streak: 1, awarded: 500 },
);

assert.deepEqual(
  calculateScore({ currentScore: 500, currentStreak: 2, questionPoints: 200, wheelValue: 'Bankrupt', isCorrect: true }),
  { score: 800, streak: 3, awarded: 300 },
);

assert.deepEqual(
  calculateScore({ currentScore: 500, currentStreak: 2, questionPoints: 200, wheelValue: 300, isCorrect: false }),
  { score: 500, streak: 0, awarded: 0 },
);

assert.deepEqual(recordMiss([], 7, false), [7]);
assert.deepEqual(recordMiss([7], 7, false), [7]);
assert.deepEqual(recordMiss([7], 8, true), [7]);
assert.deepEqual(clearReviewedMiss([7, 8], 7, true, 'review'), [8]);
assert.deepEqual(clearReviewedMiss([7, 8], 7, false, 'review'), [7, 8]);

console.log('gameLogic tests passed');
