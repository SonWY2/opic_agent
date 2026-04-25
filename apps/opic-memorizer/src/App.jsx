import { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  Check,
  Eye,
  EyeOff,
  Layers3,
  Mic2,
  RotateCcw,
  Shuffle,
  Sparkles
} from 'lucide-react';
import dataset from './data/opic-2026-04-22.json';
import { useStudyProgress } from './hooks/useStudyProgress.js';
import {
  getQuestionStats,
  markQuestionViewed,
  rateSentence,
  recordQuizAttempt
} from './lib/progress.js';
import { blankEnglishSentence, getAlignedPairs, stableShuffle } from './lib/study.js';

const modes = [
  { id: 'flow', label: 'Flow', icon: BookOpen },
  { id: 'drill', label: '1:1 Drill', icon: Layers3 },
  { id: 'variants', label: 'Variants', icon: Sparkles },
  { id: 'order', label: 'Order Quiz', icon: Shuffle },
  { id: 'blank', label: 'Blank Recall', icon: EyeOff },
  { id: 'shadowing', label: 'Shadowing', icon: Mic2 }
];

export default function App() {
  const { progress, updateProgress } = useStudyProgress(dataset.datasetDate);
  const initialTopic = findTopic(progress.lastOpened?.topicId) ?? dataset.topics[0];
  const initialQuestion = findQuestion(progress.lastOpened?.questionId) ?? initialTopic.questions[0];
  const [selectedTopicId, setSelectedTopicId] = useState(initialTopic.id);
  const [selectedQuestionId, setSelectedQuestionId] = useState(initialQuestion.id);
  const [mode, setMode] = useState('flow');

  const topic = findTopic(selectedTopicId) ?? dataset.topics[0];
  const question = findQuestion(selectedQuestionId) ?? topic.questions[0];

  useEffect(() => {
    updateProgress((current) =>
      markQuestionViewed(current, question.id, {
        topicId: topic.id,
        questionId: question.id
      })
    );
  }, [question.id, topic.id, updateProgress]);

  const selectedStats = getQuestionStats(question, progress);

  function selectTopic(nextTopic) {
    setSelectedTopicId(nextTopic.id);
    setSelectedQuestionId(nextTopic.questions[0].id);
    setMode('flow');
  }

  function selectQuestion(nextQuestion) {
    setSelectedQuestionId(nextQuestion.id);
    setMode('flow');
  }

  function handleRate(sentenceId, rating) {
    updateProgress((current) => rateSentence(current, question.id, sentenceId, rating));
  }

  function handleQuizAttempt(correct) {
    updateProgress((current) => recordQuizAttempt(current, question.id, correct));
  }

  return (
    <main className="app-shell">
      <aside className="topic-rail" aria-label="Topic navigation">
        <div className="brand-block">
          <div className="brand-mark">OM</div>
          <div>
            <h1>OPIc Memorizer</h1>
            <p>{dataset.datasetDate} pack</p>
          </div>
        </div>

        <div className="pack-stats" aria-label="Pack statistics">
          <span>{dataset.stats.topicCount} topics</span>
          <span>{dataset.stats.questionCount} questions</span>
          <span>{dataset.stats.alignmentIssueCount} review</span>
        </div>

        <nav className="topic-list">
          {dataset.topics.map((nextTopic) => (
            <button
              key={nextTopic.id}
              className={nextTopic.id === topic.id ? 'topic-button active' : 'topic-button'}
              onClick={() => selectTopic(nextTopic)}
            >
              <span>{nextTopic.title}</span>
              <strong>{nextTopic.questions.length}</strong>
            </button>
          ))}
        </nav>
      </aside>

      <section className="question-column" aria-label="Question list">
        <div className="column-heading">
          <span>Topic</span>
          <h2>{topic.title}</h2>
        </div>

        <div className="question-list">
          {topic.questions.map((nextQuestion) => {
            const stats = getQuestionStats(nextQuestion, progress);
            return (
              <button
                key={nextQuestion.id}
                className={nextQuestion.id === question.id ? 'question-button active' : 'question-button'}
                onClick={() => selectQuestion(nextQuestion)}
              >
                <span className="question-title">{nextQuestion.title}</span>
                <span className="question-meta">
                  {stats.viewed ? 'viewed' : 'new'} · {stats.mastered}/{stats.total || '-'} mastered
                </span>
                <span className="progress-track" aria-hidden="true">
                  <span style={{ width: `${stats.completion}%` }} />
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="study-stage" aria-label="Study area">
        <header className="study-header">
          <div>
            <p className="eyebrow">{topic.title}</p>
            <h2>{question.title}</h2>
            <p className="prompt">{question.promptKo}</p>
            <p className="prompt muted">{question.promptEn}</p>
          </div>

          <div className="status-cluster" aria-label="Progress summary">
            <Metric label="Viewed" value={selectedStats.viewed ? 'Yes' : 'No'} />
            <Metric label="Hard" value={selectedStats.hard} />
            <Metric label="Mastered" value={`${selectedStats.mastered}/${selectedStats.total || '-'}`} />
          </div>
        </header>

        <div className="mode-tabs" role="tablist" aria-label="Study modes">
          {modes.map((nextMode) => {
            const Icon = nextMode.icon;
            return (
              <button
                key={nextMode.id}
                type="button"
                className={nextMode.id === mode ? 'mode-tab active' : 'mode-tab'}
                onClick={() => setMode(nextMode.id)}
              >
                <Icon size={17} aria-hidden="true" />
                <span>{nextMode.label}</span>
              </button>
            );
          })}
        </div>

        <StudyMode
          mode={mode}
          question={question}
          progress={progress}
          onRate={handleRate}
          onQuizAttempt={handleQuizAttempt}
        />
      </section>
    </main>
  );
}

function StudyMode({ mode, question, progress, onRate, onQuizAttempt }) {
  if (mode === 'drill') return <DrillMode question={question} progress={progress} onRate={onRate} />;
  if (mode === 'variants') return <VariantsMode question={question} onRate={onRate} />;
  if (mode === 'order') return <OrderQuizMode question={question} onQuizAttempt={onQuizAttempt} />;
  if (mode === 'blank') return <BlankRecallMode question={question} />;
  if (mode === 'shadowing') return <ShadowingMode question={question} />;
  return <FlowMode question={question} />;
}

function FlowMode({ question }) {
  const [selectedPair, setSelectedPair] = useState(null);

  useEffect(() => {
    if (!selectedPair) return undefined;
    const timeout = window.setTimeout(() => setSelectedPair(null), 3500);
    return () => window.clearTimeout(timeout);
  }, [selectedPair]);

  return (
    <section className="mode-panel flow-grid">
      <div className="flow-points">
        <h3>암기 포인트 및 흐름</h3>
        <ol>
          {question.flowPoints.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ol>
      </div>

      <div className="script-stack">
        <div className="section-title-row">
          <h3>한국어 흐름 암기</h3>
          {question.hasAlignmentIssue && <span className="review-badge">line review needed</span>}
        </div>
        {question.scriptPairs.map((pair) => (
          <button
            key={pair.id}
            className={pair.status === 'aligned' ? 'script-line' : 'script-line needs-review'}
            onClick={() => setSelectedPair(pair)}
          >
            <span>{pair.index}</span>
            <strong>{pair.ko || pair.en}</strong>
          </button>
        ))}
      </div>

      {selectedPair && (
        <div className="toast" role="status">
          <span>English</span>
          <p>{selectedPair.en || 'This line needs manual alignment review.'}</p>
        </div>
      )}
    </section>
  );
}

function DrillMode({ question, progress, onRate }) {
  const pairs = getAlignedPairs(question);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const pair = pairs[index] ?? null;
  const ratings = progress.ratedSentences[question.id] ?? {};

  useEffect(() => {
    setIndex(0);
    setRevealed(false);
  }, [question.id]);

  if (!pairs.length) {
    return (
      <EmptyMode
        title="Line alignment needs review"
        body="This question still supports Flow and Variants, but full-script 1:1 drilling is disabled until Korean and English lines are aligned."
      />
    );
  }

  function rateAndAdvance(rating) {
    onRate(pair.id, rating);
    setRevealed(false);
    setIndex((current) => (current + 1) % pairs.length);
  }

  return (
    <section className="mode-panel drill-panel">
      <div className="card-counter">
        <span>Sentence {index + 1} / {pairs.length}</span>
        <span>{ratings[pair.id]?.rating ?? 'unrated'}</span>
      </div>

      <div className="recall-card">
        <p className="card-label">Korean cue</p>
        <h3>{pair.ko}</h3>
        {revealed ? (
          <div className="answer-block">
            <p className="card-label">English answer</p>
            <p>{pair.en}</p>
          </div>
        ) : (
          <button className="primary-action" onClick={() => setRevealed(true)}>
            <Eye size={18} aria-hidden="true" />
            Reveal English
          </button>
        )}
      </div>

      <div className="rating-row">
        <button onClick={() => rateAndAdvance('again')}>Again</button>
        <button onClick={() => rateAndAdvance('hard')}>Hard</button>
        <button onClick={() => rateAndAdvance('good')}>Good</button>
        <button className="success" onClick={() => rateAndAdvance('mastered')}>Mastered</button>
      </div>
    </section>
  );
}

function VariantsMode({ question, onRate }) {
  const groups = question.keySentenceGroups;
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const group = groups[index] ?? null;

  useEffect(() => {
    setIndex(0);
    setRevealed(false);
  }, [question.id]);

  if (!group) {
    return <EmptyMode title="No variant cards" body="This question does not include variant expression cards yet." />;
  }

  return (
    <section className="mode-panel variant-panel">
      <div className="card-counter">
        <span>Variant card {index + 1} / {groups.length}</span>
        <button onClick={() => setRevealed((value) => !value)}>
          {revealed ? 'Hide variants' : 'Show variants'}
        </button>
      </div>

      <div className="recall-card">
        <p className="card-label">Korean key sentence</p>
        <h3>{group.ko}</h3>
        {group.koAlternatives.length > 1 && (
          <p className="alt-line">Also: {group.koAlternatives.slice(1).join(' / ')}</p>
        )}
      </div>

      {revealed && (
        <div className="variant-list">
          {group.variants.map((variant) => (
            <p key={variant}>{variant}</p>
          ))}
        </div>
      )}

      <div className="rating-row">
        <button onClick={() => onRate(group.id, 'hard')}>Hard</button>
        <button className="success" onClick={() => onRate(group.id, 'mastered')}>Mastered</button>
        <button onClick={() => {
          setRevealed(false);
          setIndex((current) => (current + 1) % groups.length);
        }}>
          Next
        </button>
      </div>
    </section>
  );
}

function OrderQuizMode({ question, onQuizAttempt }) {
  const pairs = getAlignedPairs(question);
  const [pool, setPool] = useState(() => stableShuffle(pairs, question.id.length));
  const [answer, setAnswer] = useState([]);
  const [result, setResult] = useState(null);

  useEffect(() => {
    setPool(stableShuffle(pairs, question.id.length));
    setAnswer([]);
    setResult(null);
  }, [question.id]);

  if (!pairs.length || question.hasAlignmentIssue) {
    return (
      <EmptyMode
        title="Line alignment needs review"
        body="Order Quiz is disabled for this question because the Korean and English full-script line counts do not match."
      />
    );
  }

  function choose(pair) {
    setPool((current) => current.filter((item) => item.id !== pair.id));
    setAnswer((current) => [...current, pair]);
    setResult(null);
  }

  function reset() {
    setPool(stableShuffle(pairs, Date.now() % 1000));
    setAnswer([]);
    setResult(null);
  }

  function checkOrder() {
    const correct = answer.length === pairs.length && answer.every((pair, index) => pair.id === pairs[index].id);
    setResult(correct ? 'Correct flow.' : 'Not yet. Compare the numbered order and try again.');
    onQuizAttempt(correct);
  }

  return (
    <section className="mode-panel order-panel">
      <div className="order-columns">
        <div>
          <h3>Shuffled Korean lines</h3>
          <div className="sortable-list">
            {pool.map((pair) => (
              <button key={pair.id} className="order-chip" onClick={() => choose(pair)}>
                {pair.ko}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3>Your answer flow</h3>
          <div className="sortable-list answer-list">
            {answer.map((pair, index) => (
              <div key={pair.id} className="answer-chip">
                <span>{index + 1}</span>
                <p>{pair.ko}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="quiz-actions">
        <button onClick={reset}>
          <RotateCcw size={17} aria-hidden="true" />
          Reset
        </button>
        <button className="success" onClick={checkOrder}>
          <Check size={17} aria-hidden="true" />
          Check Order
        </button>
      </div>
      {result && <p className="quiz-result">{result}</p>}
    </section>
  );
}

function BlankRecallMode({ question }) {
  const pairs = getAlignedPairs(question);
  const [revealedIds, setRevealedIds] = useState(() => new Set());

  useEffect(() => {
    setRevealedIds(new Set());
  }, [question.id]);

  if (!pairs.length) {
    return (
      <EmptyMode
        title="Line alignment needs review"
        body="Blank Recall needs trusted one-to-one script pairs. Use Variants mode for this question."
      />
    );
  }

  function toggle(pairId) {
    setRevealedIds((current) => {
      const next = new Set(current);
      if (next.has(pairId)) next.delete(pairId);
      else next.add(pairId);
      return next;
    });
  }

  return (
    <section className="mode-panel blank-panel">
      {pairs.map((pair) => {
        const revealed = revealedIds.has(pair.id);
        return (
          <button key={pair.id} className="blank-line" onClick={() => toggle(pair.id)}>
            <span>{pair.index}</span>
            <strong>{revealed ? pair.en : blankEnglishSentence(pair.en)}</strong>
            <small>{pair.ko}</small>
          </button>
        );
      })}
    </section>
  );
}

function ShadowingMode({ question }) {
  const pairs = question.scriptPairs.filter((pair) => pair.en);
  const [index, setIndex] = useState(0);
  const [showKorean, setShowKorean] = useState(false);
  const pair = pairs[index] ?? null;

  useEffect(() => {
    setIndex(0);
    setShowKorean(false);
  }, [question.id]);

  if (!pair) return <EmptyMode title="No shadowing lines" body="This question does not include English script lines." />;

  return (
    <section className="mode-panel shadow-panel">
      <div className="card-counter">
        <span>Shadowing {index + 1} / {pairs.length}</span>
        <button onClick={() => setShowKorean((value) => !value)}>
          {showKorean ? 'Hide Korean' : 'Show Korean'}
        </button>
      </div>

      <div className="shadow-card">
        <p>{pair.en}</p>
        {showKorean && <small>{pair.ko || 'Korean line needs alignment review.'}</small>}
      </div>

      <div className="rating-row">
        <button onClick={() => setIndex((current) => Math.max(0, current - 1))}>Previous</button>
        <button className="success" onClick={() => setIndex((current) => (current + 1) % pairs.length)}>Next</button>
      </div>
    </section>
  );
}

function EmptyMode({ title, body }) {
  return (
    <section className="mode-panel empty-mode">
      <h3>{title}</h3>
      <p>{body}</p>
    </section>
  );
}

function Metric({ label, value }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function findTopic(topicId) {
  return dataset.topics.find((topic) => topic.id === topicId);
}

function findQuestion(questionId) {
  return dataset.topics.flatMap((topic) => topic.questions).find((question) => question.id === questionId);
}
