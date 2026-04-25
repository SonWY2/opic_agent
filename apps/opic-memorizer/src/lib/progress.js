export const ratingLabels = {
  again: 'Again',
  hard: 'Hard',
  good: 'Good',
  mastered: 'Mastered'
};

export function getProgressStorageKey(datasetDate) {
  return `opic-memorizer:progress:${datasetDate}`;
}

export function createEmptyProgress(datasetDate) {
  return {
    datasetDate,
    lastOpened: null,
    questionViews: {},
    ratedSentences: {},
    quizAttempts: {}
  };
}

export function loadProgress(datasetDate, storage = window.localStorage) {
  const fallback = createEmptyProgress(datasetDate);
  try {
    const raw = storage.getItem(getProgressStorageKey(datasetDate));
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed?.datasetDate === datasetDate ? { ...fallback, ...parsed } : fallback;
  } catch {
    return fallback;
  }
}

export function saveProgress(progress, storage = window.localStorage) {
  storage.setItem(getProgressStorageKey(progress.datasetDate), JSON.stringify(progress));
}

export function markQuestionViewed(progress, questionId, lastOpened) {
  return {
    ...progress,
    lastOpened,
    questionViews: {
      ...progress.questionViews,
      [questionId]: (progress.questionViews[questionId] ?? 0) + 1
    }
  };
}

export function rateSentence(progress, questionId, sentenceId, rating, updatedAt = Date.now()) {
  return {
    ...progress,
    ratedSentences: {
      ...progress.ratedSentences,
      [questionId]: {
        ...(progress.ratedSentences[questionId] ?? {}),
        [sentenceId]: { rating, updatedAt }
      }
    }
  };
}

export function recordQuizAttempt(progress, questionId, correct, attemptedAt = Date.now()) {
  return {
    ...progress,
    quizAttempts: {
      ...progress.quizAttempts,
      [questionId]: [
        ...(progress.quizAttempts[questionId] ?? []),
        { correct, attemptedAt }
      ]
    }
  };
}

export function getQuestionStats(question, progress) {
  const alignedPairs = question.scriptPairs.filter((pair) => pair.status === 'aligned');
  const ratings = progress.ratedSentences[question.id] ?? {};
  const mastered = alignedPairs.filter((pair) => ratings[pair.id]?.rating === 'mastered').length;
  const hard = alignedPairs.filter((pair) => ratings[pair.id]?.rating === 'hard').length;
  const total = alignedPairs.length;

  return {
    viewed: Boolean(progress.questionViews[question.id]),
    total,
    mastered,
    hard,
    completion: total === 0 ? 0 : Math.round((mastered / total) * 100)
  };
}

