import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { buildStudyDataFromDirectory } from '../scripts/build-study-data.mjs';

const testDir = path.dirname(fileURLToPath(import.meta.url));
const sourceRoot = path.resolve(testDir, '../../../outputs/opic/2026-04-22');

describe('study data parser', () => {
  it('discovers every 2026-04-22 question file and required section', () => {
    const data = buildStudyDataFromDirectory(sourceRoot);

    expect(data.datasetDate).toBe('2026-04-22');
    expect(data.stats.topicCount).toBe(12);
    expect(data.stats.questionCount).toBe(59);
    expect(data.stats.missingRequiredSections).toEqual([]);
    expect(data.topics[0].questions[0]).toMatchObject({
      id: '01-self-intro/q01-self-intro',
      promptKo: '자기소개를 해 주세요.',
      promptEn: 'Tell me about yourself.'
    });
  });

  it('keeps aligned full scripts as one-to-one sentence pairs', () => {
    const data = buildStudyDataFromDirectory(sourceRoot);
    const firstQuestion = data.topics[0].questions[0];

    expect(firstQuestion.hasAlignmentIssue).toBe(false);
    expect(firstQuestion.scriptPairs).toHaveLength(11);
    expect(firstQuestion.scriptPairs[0]).toMatchObject({
      index: 1,
      ko: '안녕하세요. 저는 김민수라고 합니다.',
      en: 'Hi, my name is Minsoo Kim.',
      status: 'aligned'
    });
  });

  it('keeps every full script aligned by line count', () => {
    const data = buildStudyDataFromDirectory(sourceRoot);
    const issueIds = data.topics
      .flatMap((topic) => topic.questions)
      .filter((question) => question.hasAlignmentIssue)
      .map((question) => question.id);

    expect(data.stats.alignedQuestionCount).toBe(59);
    expect(data.stats.alignmentIssueCount).toBe(0);
    expect(issueIds).toEqual([]);
  });

  it('parses key Korean sentence groups with multiple English variants', () => {
    const data = buildStudyDataFromDirectory(sourceRoot);
    const firstQuestion = data.topics[0].questions[0];

    expect(firstQuestion.keySentenceGroups).toHaveLength(5);
    expect(firstQuestion.keySentenceGroups[0]).toMatchObject({
      ko: '저는 판교의 IT 회사에서 소프트웨어 엔지니어로 일합니다.'
    });
    expect(firstQuestion.keySentenceGroups[0].variants).toHaveLength(3);
  });

  it('keeps drive memory flow points limited to markdown bullets', () => {
    const data = buildStudyDataFromDirectory(sourceRoot);
    const driveDestination = data.topics
      .find((topic) => topic.id === '07-drive')
      .questions.find((question) => question.slug === 'q01-destination');

    expect(driveDestination.flowPoints).toEqual([
      '출발 준비 -> 짧은 거리 -> 차 안 분위기 -> 도착 후 산책 -> 카페 한 번 -> 귀가 -> 짧은 기분 전환',
      '각 문장은 다음 장면으로 넘어가게 만들어서 순서가 무너지면 흐름이 바로 어색해지도록 한다',
      '핵심 표현은 `출발하기 전에`, `그래서`, `도착하면`, `그다음에는`, `돌아오는 길에는`, `그래서 저는`'
    ]);
    expect(driveDestination.flowPoints).not.toContain('### 이야기 흐름도');
  });
});
