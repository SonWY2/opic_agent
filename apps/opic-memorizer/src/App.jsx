import { useEffect, useRef, useState } from 'react';
import {
  BookOpen,
  Check,
  ChevronDown,
  Copy,
  Eye,
  EyeOff,
  Layers3,
  Mic2,
  Languages,
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
  { id: 'flow', label: 'Korean Flow', icon: BookOpen },
  { id: 'english-flow', label: 'English Flow', icon: Languages },
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
  const [isMobileControlsOpen, setIsMobileControlsOpen] = useState(false);

  const topic = findTopic(selectedTopicId) ?? dataset.topics[0];
  const question = findQuestion(selectedQuestionId) ?? topic.questions[0];
  const questionIndex = Math.max(0, topic.questions.findIndex((item) => item.id === question.id));
  const isEnglishFlow = mode === 'english-flow';
  const mobileToggleLabel = isMobileControlsOpen ? (isEnglishFlow ? 'Close' : '접기') : 'Topic';

  useEffect(() => {
    updateProgress((current) =>
      markQuestionViewed(current, question.id, {
        topicId: topic.id,
        questionId: question.id
      })
    );
  }, [question.id, topic.id, updateProgress]);

  const selectedStats = getQuestionStats(question, progress);

  function selectTopicById(nextTopicId) {
    const nextTopic = findTopic(nextTopicId);
    if (!nextTopic) return;
    setSelectedTopicId(nextTopic.id);
    setSelectedQuestionId(nextTopic.questions[0].id);
    setMode('flow');
  }

  function selectQuestion(nextQuestion) {
    setSelectedQuestionId(nextQuestion.id);
    setMode('flow');
    setIsMobileControlsOpen(false);
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
        <div className="rail-hero">
          <div className="brand-block">
            <div className="brand-mark">OM</div>
            <div>
              <p>{dataset.datasetDate} pack</p>
              <h1>OPIc Memorizer</h1>
            </div>
          </div>

          <div className="pack-stats" aria-label="Pack statistics">
            <span>{dataset.stats.topicCount} topics</span>
            <span>{dataset.stats.questionCount} questions</span>
            <span>{dataset.stats.alignmentIssueCount} review</span>
          </div>
        </div>

        <nav className="topic-list">
          {dataset.topics.map((nextTopic) => (
            <button
              key={nextTopic.id}
              type="button"
              className={nextTopic.id === topic.id ? 'topic-button active' : 'topic-button'}
              onClick={() => selectTopicById(nextTopic.id)}
              aria-pressed={nextTopic.id === topic.id}
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
                type="button"
                className={nextQuestion.id === question.id ? 'question-button active' : 'question-button'}
                onClick={() => selectQuestion(nextQuestion)}
                aria-pressed={nextQuestion.id === question.id}
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
        <div
          className={isMobileControlsOpen ? 'mobile-toolbar open' : 'mobile-toolbar'}
          aria-label="Mobile study controls"
        >
          <div className="mobile-toolbar-summary">
            <div className="mobile-current">
              <span>{topic.title}</span>
              <strong>{question.title}</strong>
            </div>

            <button
              type="button"
              className="mobile-controls-toggle"
              onClick={() => setIsMobileControlsOpen((value) => !value)}
              aria-expanded={isMobileControlsOpen}
              aria-controls="mobile-topic-panel"
            >
              {mobileToggleLabel}
              <ChevronDown size={16} aria-hidden="true" />
            </button>
          </div>

          {isMobileControlsOpen && (
            <div className="mobile-topic-panel" id="mobile-topic-panel">
              <div className="mobile-meta-row">
                <span>Q {questionIndex + 1}/{topic.questions.length}</span>
                <span>{selectedStats.viewed ? 'Viewed' : 'New'}</span>
                <span>{selectedStats.completion}% done</span>
                <span>{selectedStats.mastered} mastered</span>
              </div>

              <label className="topic-select">
                <span>Topic</span>
                <div className="select-shell">
                  <select
                    aria-label="Mobile topic selector"
                    value={topic.id}
                    onChange={(event) => selectTopicById(event.target.value)}
                  >
                    {dataset.topics.map((nextTopic) => (
                      <option key={nextTopic.id} value={nextTopic.id}>
                        {nextTopic.title}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={16} aria-hidden="true" />
                </div>
              </label>

              <div className="mobile-question-strip" aria-label="Mobile question rail">
                {topic.questions.map((nextQuestion) => {
                  const stats = getQuestionStats(nextQuestion, progress);

                  return (
                    <button
                      key={nextQuestion.id}
                      type="button"
                      className={nextQuestion.id === question.id ? 'question-chip active' : 'question-chip'}
                      onClick={() => selectQuestion(nextQuestion)}
                      aria-pressed={nextQuestion.id === question.id}
                    >
                      <span>{nextQuestion.title}</span>
                      <small>
                        {stats.completion}% · {stats.mastered}/{stats.total || '-'}
                      </small>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <header className="study-header">
          <div>
            <p className="eyebrow">Now studying</p>
            <h2>{question.title}</h2>
            {isEnglishFlow ? (
              <p className="prompt">{question.promptEn}</p>
            ) : (
              <>
                <p className="prompt">{question.promptKo}</p>
                <p className="prompt muted">{question.promptEn}</p>
              </>
            )}
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
          key={`${mode}:${question.id}`}
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
  if (mode === 'english-flow') return <EnglishFlowMode question={question} />;
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
        <div className="section-header">
          <span>Memory flow</span>
          <h3>암기 포인트 및 흐름</h3>
        </div>
        <ol>
          {question.flowPoints.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ol>
      </div>

      <div className="script-stack">
        <div className="section-title-row">
          <div className="section-header">
            <span>Sentence map</span>
            <h3>한국어 흐름 암기</h3>
          </div>
          {question.hasAlignmentIssue && <span className="review-badge">line review needed</span>}
        </div>
        {question.scriptPairs.map((pair) => (
          <button
            key={pair.id}
            className={pair.status === 'aligned' ? 'script-line' : 'script-line needs-review'}
            onClick={() => setSelectedPair(pair)}
            type="button"
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

function EnglishFlowMode({ question }) {
  const firstPairId = question.scriptPairs.find((pair) => pair.en)?.id ?? null;
  const pairs = question.scriptPairs.filter((pair) => pair.en);
  const [focusedPairId, setFocusedPairId] = useState(() => firstPairId);
  const [copyState, setCopyState] = useState('idle');
  const copyTimerRef = useRef(null);
  const focusedPair = pairs.find((pair) => pair.id === focusedPairId) ?? null;
  const englishScript = pairs.map((pair) => pair.en).join('\n\n');

  useEffect(() => {
    setFocusedPairId(firstPairId);
    setCopyState('idle');
    if (copyTimerRef.current) {
      window.clearTimeout(copyTimerRef.current);
      copyTimerRef.current = null;
    }
  }, [firstPairId]);

  useEffect(
    () => () => {
      if (copyTimerRef.current) {
        window.clearTimeout(copyTimerRef.current);
      }
    },
    []
  );

  if (!pairs.length) {
    return (
      <EmptyMode
        title="No English flow lines"
        body="This question does not include English script lines yet."
      />
    );
  }

  async function handleCopyAll() {
    try {
      if (copyTimerRef.current) {
        window.clearTimeout(copyTimerRef.current);
      }
      setCopyState('copying');
      await copyTextToClipboard(englishScript);
      setCopyState('copied');
    } catch {
      setCopyState('error');
    } finally {
      copyTimerRef.current = window.setTimeout(() => {
        setCopyState('idle');
        copyTimerRef.current = null;
      }, 1800);
    }
  }

  const copyLabel =
    copyState === 'copied'
      ? 'Copied'
      : copyState === 'error'
        ? 'Retry copy'
        : copyState === 'copying'
          ? 'Copying...'
          : 'Copy script';

  return (
    <section className="mode-panel flow-grid">
      <div className="flow-points">
        <div className="section-header">
          <span>English flow</span>
          <h3>English script in order</h3>
        </div>
        <p className="prompt muted">The Korean script is hidden in this view.</p>
        <p className="prompt muted">
          {focusedPair ? `Focused line ${focusedPair.index}` : 'Tap a line to focus it.'}
        </p>
      </div>

      <div className="script-stack">
        <div className="section-title-row">
          <div className="section-header">
            <span>Reading order</span>
            <h3>English lines only</h3>
          </div>
          <div className="section-title-actions">
            <button
              type="button"
              className="copy-script-button"
              data-state={copyState}
              onClick={handleCopyAll}
              disabled={copyState === 'copying'}
            >
              {copyState === 'copied' ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
              <span>{copyLabel}</span>
            </button>
            {question.hasAlignmentIssue && <span className="review-badge">line review needed</span>}
          </div>
        </div>
        {pairs.map((pair) => (
          <button
            key={pair.id}
            className={pair.id === focusedPair?.id ? 'script-line is-selected' : 'script-line'}
            onClick={() => setFocusedPairId(pair.id)}
            type="button"
          >
            <span>{pair.index}</span>
            <strong>{pair.en}</strong>
          </button>
        ))}
      </div>
    </section>
  );
}

async function copyTextToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', 'true');
  textarea.style.position = 'fixed';
  textarea.style.top = '-1000px';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    const didCopy = document.execCommand?.('copy');
    if (!didCopy) {
      throw new Error('Copy to clipboard failed');
    }
  } finally {
    document.body.removeChild(textarea);
  }
}

function DrillMode({ question, progress, onRate }) {
  const orderedPairs = getAlignedPairs(question);
  const [orderMode, setOrderMode] = useState('ordered');
  const [shuffleNonce, setShuffleNonce] = useState(0);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const pairs =
    orderMode === 'random'
      ? stableShuffle(orderedPairs, shuffleNonce * 2 - 1)
      : orderedPairs;
  const pair = pairs[index] ?? null;
  const ratings = progress.ratedSentences[question.id] ?? {};

  useEffect(() => {
    setOrderMode('ordered');
    setShuffleNonce(0);
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

  function setOrderedSequence() {
    setOrderMode('ordered');
    setIndex(0);
    setRevealed(false);
  }

  function setRandomSequence() {
    setOrderMode('random');
    setShuffleNonce((current) => current + 1);
    setIndex(0);
    setRevealed(false);
  }

  return (
    <section className="mode-panel drill-panel">
      <div className="card-counter">
        <span>Sentence {index + 1} / {pairs.length}</span>
        <span>{ratings[pair.id]?.rating ?? 'unrated'}</span>
      </div>

      <div className="drill-option-row">
        <span>순서</span>
        <div className="drill-order-toggle" role="group" aria-label="Drill order mode">
          <button
            type="button"
            className={orderMode === 'ordered' ? 'active' : ''}
            onClick={setOrderedSequence}
            aria-pressed={orderMode === 'ordered'}
          >
            <RotateCcw size={16} aria-hidden="true" />
            기본 순서
          </button>
          <button
            type="button"
            className={orderMode === 'random' ? 'active' : ''}
            onClick={setRandomSequence}
            aria-pressed={orderMode === 'random'}
          >
            <Shuffle size={16} aria-hidden="true" />
            랜덤 순서
          </button>
        </div>
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
          <button className="primary-action" onClick={() => setRevealed(true)} type="button">
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
        <button onClick={() => setRevealed((value) => !value)} type="button">
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
        <button onClick={() => onRate(group.id, 'hard')} type="button">Hard</button>
        <button className="success" onClick={() => onRate(group.id, 'mastered')} type="button">Mastered</button>
        <button
          onClick={() => {
            setRevealed(false);
            setIndex((current) => (current + 1) % groups.length);
          }}
          type="button"
        >
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
          <div className="section-header">
            <span>Rebuild flow</span>
            <h3>Shuffled Korean lines</h3>
          </div>
          <div className="sortable-list">
            {pool.map((pair) => (
              <button key={pair.id} className="order-chip" onClick={() => choose(pair)} type="button">
                {pair.ko}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="section-header">
            <span>Rebuild flow</span>
            <h3>Your answer flow</h3>
          </div>
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
        <button onClick={reset} type="button">
          <RotateCcw size={17} aria-hidden="true" />
          Reset
        </button>
        <button className="success" onClick={checkOrder} type="button">
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
          <button key={pair.id} className="blank-line" onClick={() => toggle(pair.id)} type="button">
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
        <button onClick={() => setShowKorean((value) => !value)} type="button">
          {showKorean ? 'Hide Korean' : 'Show Korean'}
        </button>
      </div>

      <div className="shadow-card">
        <p>{pair.en}</p>
        {showKorean && <small>{pair.ko || 'Korean line needs alignment review.'}</small>}
      </div>

      <div className="rating-row">
        <button onClick={() => setIndex((current) => Math.max(0, current - 1))} type="button">Previous</button>
        <button className="success" onClick={() => setIndex((current) => (current + 1) % pairs.length)} type="button">Next</button>
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
