import { categories, questionBank, wheelValues } from './questionBank.js';
import { calculateScore, clearReviewedMiss, createInitialState, getCurrentQuestion, recordMiss } from './gameLogic.js';

const STORAGE_KEY = 'rules-wheel-state-v2';
const savedState = loadSavedState();
const state = savedState ?? createInitialState();
const root = document.querySelector('#root');
const icon = name => ({ sparkles: '✦', book: '📘', trophy: '🏆', spin: '↻', correct: '✓', wrong: '✕' }[name]);

function persistState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadSavedState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? { ...createInitialState(), ...JSON.parse(saved) } : null;
  } catch {
    return null;
  }
}

function setState(patch) {
  Object.assign(state, patch);
  persistState();
  render();
}

function spinWheel() {
  setState({
    wheel: wheelValues[Math.floor(Math.random() * wheelValues.length)],
    spinToken: state.spinToken + 1,
    selected: null,
    answered: false,
    awarded: null,
  });
}

function submitAnswer() {
  const current = getCurrentQuestion(questionBank, state);
  if (state.selected === null || !current || state.wheel === null) return;

  const isCorrect = state.selected === current.answer;
  const result = calculateScore({
    currentScore: state.score,
    currentStreak: state.streak,
    questionPoints: current.points,
    wheelValue: state.wheel,
    isCorrect,
  });

  setState({
    score: result.score,
    streak: result.streak,
    awarded: result.awarded,
    missedIds: state.mode === 'review'
      ? clearReviewedMiss(state.missedIds, current.id, isCorrect, state.mode)
      : recordMiss(state.missedIds, current.id, isCorrect),
    answered: true,
  });
}

function nextQuestion() {
  const current = getCurrentQuestion(questionBank, state);
  if (current) state.usedIds.push(current.id);
  setState({ selected: null, answered: false, wheel: null, awarded: null });
}

function resetGame() {
  Object.assign(state, createInitialState());
  localStorage.removeItem(STORAGE_KEY);
  render();
}

function switchMode(mode) {
  setState({ mode, usedIds: [], selected: null, answered: false, wheel: null, awarded: null });
}

function renderStart() {
  return `<main class="shell hero">
    <section class="card intro-card">
      <div class="badge">${icon('sparkles')} R&A Level 3 Rules Exam Study Game</div>
      <h1>Rules Wheel Challenge</h1>
      <p>A solo, game-show-style web app for practising Rules of Golf exam questions across your requested categories.</p>
      <div class="category-grid">${categories.map(category => `<span>${category}</span>`).join('')}</div>
      <div class="notice"><span>${icon('book')}</span><p>This build ships with 100 original, paraphrased practice questions and citation fields. Review the references in <code>src/questionBank.js</code> against your official materials before using it for formal exam preparation.</p></div>
      <div class="start-actions"><button class="primary" data-action="start">Start solo game</button><button class="secondary" data-action="review-start">Review missed questions</button></div>
    </section>
  </main>`;
}

function renderComplete() {
  return `<main class="shell hero">
    <section class="card intro-card">
      <div class="big-icon">${icon('trophy')}</div>
      <h1>Game complete!</h1>
      <p>Your final score is <strong>${state.score}</strong>.</p>
      <button class="primary" data-action="reset">Play again</button>
    </section>
  </main>`;
}

function renderGame() {
  const current = getCurrentQuestion(questionBank, state);
  if (!current) return renderComplete();

  const wheelStateClass = state.wheel === 'Bankrupt' ? 'danger' : state.wheel === 'Lose Turn' ? 'warning' : 'good';
  const modeLabel = state.mode === 'review' ? 'Review missed questions' : 'Solo practice';
  const categoryOptions = categories.map(category => `<option ${state.activeCategory === category ? 'selected' : ''}>${category}</option>`).join('');

  return `<main class="shell">
    <header class="topbar">
      <div><p class="eyebrow">${modeLabel}</p><h1>Rules Wheel Challenge</h1></div>
      <div class="scorecard"><span>Score</span><strong>${state.score}</strong></div>
    </header>
    <section class="controls card">
      <label>Category focus<select data-action="category"><option>All</option>${categoryOptions}</select></label>
      <div class="mode-actions"><button class="pill-button ${state.mode === 'practice' ? 'active' : ''}" data-action="practice-mode">Practice</button><button class="pill-button ${state.mode === 'review' ? 'active' : ''}" data-action="review-mode">Review missed (${state.missedIds.length})</button></div>
      <div class="stats"><span>Question ${state.usedIds.length + 1} / ${questionBank.length}</span><span>Streak ${state.streak}</span></div>
    </section>
    <section class="game-grid">
      <aside class="card wheel-card">
        <div class="wheel ${wheelStateClass} ${state.wheel ? 'has-spun' : ''}" style="--spin-token: ${state.spinToken}">${state.wheel ?? '?'}</div>
        <button class="primary" data-action="spin">${icon('spin')} Spin the wheel</button>
        <p>Spin before answering. Bankrupt and Lose Turn award no wheel points.</p>
      </aside>
      <section class="card question-card">
        <div class="question-meta"><span>${current.category}</span><span>${current.points} question pts</span></div>
        <h2>${current.prompt}</h2>
        <div class="answers">${renderAnswers(current)}</div>
        <button class="secondary" ${(state.selected === null || state.answered || state.wheel === null) ? 'disabled' : ''} data-action="submit">Lock in answer</button>
        ${state.answered ? renderResult(current) : ''}
        ${state.answered ? '<button class="primary" data-action="next">Next question</button>' : ''}
      </section>
    </section>
  </main>`;
}

function renderAnswers(current) {
  return current.choices.map((choice, index) => `<button class="answer ${state.selected === index ? 'selected' : ''}" ${state.answered ? 'disabled' : ''} data-action="select" data-index="${index}">${choice}</button>`).join('');
}

function renderResult(current) {
  const correct = state.selected === current.answer;
  const pointsLine = correct ? `<p class="points-earned">Points earned: ${state.awarded}</p>` : '';

  return `<div class="result ${correct ? 'correct' : 'incorrect'}">
    <span>${icon(correct ? 'correct' : 'wrong')}</span>
    <div><strong>${correct ? 'Correct!' : 'Not quite.'}</strong>${pointsLine}<p>${current.explanation}</p><small>Citation: ${current.citation}</small></div>
  </div>`;
}

function render() {
  root.innerHTML = state.screen === 'start' ? renderStart() : renderGame();
}

root.addEventListener('click', event => {
  const target = event.target.closest('[data-action]');
  if (!target) return;

  const action = target.dataset.action;
  if (action === 'start') setState({ screen: 'game', mode: 'practice' });
  if (action === 'review-start') setState({ screen: 'game', mode: 'review', usedIds: [] });
  if (action === 'reset') resetGame();
  if (action === 'spin') spinWheel();
  if (action === 'practice-mode') switchMode('practice');
  if (action === 'review-mode') switchMode('review');
  if (action === 'select') setState({ selected: Number(target.dataset.index) });
  if (action === 'submit') submitAnswer();
  if (action === 'next') nextQuestion();
});

root.addEventListener('change', event => {
  if (event.target.matches('[data-action="category"]')) {
    setState({ activeCategory: event.target.value, wheel: null, selected: null, answered: false, awarded: null });
  }
});

render();
