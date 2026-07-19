export const initialState = {
  screen: 'start',
  score: 0,
  streak: 0,
  selected: null,
  answered: false,
  wheel: null,
  awarded: null,
  usedIds: [],
  missedIds: [],
  activeCategory: 'All',
  mode: 'practice',
  spinToken: 0,
};

export function createInitialState() {
  return structuredClone(initialState);
}

export function getAvailableQuestions(questionBank, state) {
  return questionBank.filter(question => {
    const isUnused = !state.usedIds.includes(question.id);
    const isMissedForReview = state.mode === 'review' ? state.missedIds.includes(question.id) : true;
    const isActiveCategory = state.activeCategory === 'All' || question.category === state.activeCategory;
    return isUnused && isMissedForReview && isActiveCategory;
  });
}

export function getCurrentQuestion(questionBank, state) {
  return getAvailableQuestions(questionBank, state)[0] ?? null;
}

export function calculateScore({ currentScore, currentStreak, questionPoints, wheelValue, isCorrect }) {
  if (!isCorrect) {
    return { score: currentScore, streak: 0, awarded: 0 };
  }

  const wheelPoints = typeof wheelValue === 'number' ? wheelValue : 0;
  const streakBonus = currentStreak >= 2 ? 100 : 0;
  const awarded = wheelPoints + questionPoints + streakBonus;

  return {
    score: currentScore + awarded,
    streak: currentStreak + 1,
    awarded,
  };
}

export function recordMiss(missedIds, questionId, isCorrect) {
  if (isCorrect || missedIds.includes(questionId)) {
    return missedIds;
  }

  return [...missedIds, questionId];
}

export function clearReviewedMiss(missedIds, questionId, isCorrect, mode) {
  if (mode !== 'review' || !isCorrect) {
    return missedIds;
  }

  return missedIds.filter(id => id !== questionId);
}
