import { describe, expect, it } from 'vitest';
import {
  createEmptyProgress,
  getQuestionStats,
  markQuestionViewed,
  rateSentence,
  recordQuizAttempt
} from '../src/lib/progress.js';

const question = {
  id: 'topic/q01',
  scriptPairs: [
    { id: 's1', status: 'aligned' },
    { id: 's2', status: 'aligned' },
    { id: 's3', status: 'needs-review' }
  ]
};

describe('study progress helpers', () => {
  it('marks question views without mutating the previous state', () => {
    const initial = createEmptyProgress('2026-04-22');
    const viewed = markQuestionViewed(initial, 'topic/q01', {
      topicId: 'topic',
      questionId: 'topic/q01'
    });

    expect(initial.questionViews).toEqual({});
    expect(viewed.questionViews['topic/q01']).toBe(1);
    expect(viewed.lastOpened).toEqual({ topicId: 'topic', questionId: 'topic/q01' });
  });

  it('tracks hard and mastered sentence ratings', () => {
    let progress = createEmptyProgress('2026-04-22');
    progress = rateSentence(progress, 'topic/q01', 's1', 'mastered', 10);
    progress = rateSentence(progress, 'topic/q01', 's2', 'hard', 20);

    expect(progress.ratedSentences['topic/q01'].s1.rating).toBe('mastered');
    expect(progress.ratedSentences['topic/q01'].s2.rating).toBe('hard');
    expect(getQuestionStats(question, progress)).toMatchObject({
      total: 2,
      mastered: 1,
      hard: 1,
      completion: 50
    });
  });

  it('records order quiz attempts', () => {
    const progress = recordQuizAttempt(createEmptyProgress('2026-04-22'), 'topic/q01', true, 42);

    expect(progress.quizAttempts['topic/q01']).toEqual([
      { correct: true, attemptedAt: 42 }
    ]);
  });
});

