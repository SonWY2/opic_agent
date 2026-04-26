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
    expect(data.stats.questionCount).toBe(57);
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

  it('flags the two known line-count mismatches instead of silently trusting them', () => {
    const data = buildStudyDataFromDirectory(sourceRoot);
    const issueIds = data.topics
      .flatMap((topic) => topic.questions)
      .filter((question) => question.hasAlignmentIssue)
      .map((question) => question.id);

    expect(data.stats.alignedQuestionCount).toBe(55);
    expect(data.stats.alignmentIssueCount).toBe(2);
    expect(issueIds).toEqual([
      '04-movies-performances-concerts/q03-past-vs-present',
      '10-vacation/q03-past-vs-present'
    ]);
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
});
