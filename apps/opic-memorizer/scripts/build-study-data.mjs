import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(scriptDir, '..');
const defaultSourceRoot = path.resolve(appRoot, '../../outputs/opic/2026-04-22');
const defaultOutputPath = path.resolve(appRoot, 'src/data/opic-2026-04-22.json');

const REQUIRED_SECTIONS = [
  '문제',
  '암기 포인트 및 흐름',
  '한국어 전문',
  '영어 전문',
  '키 문장 및 단어',
  '키 한국어 문장 및 대응되는 영어표현 여러개'
];

export function buildStudyDataFromDirectory(sourceRoot = defaultSourceRoot) {
  const markdownFiles = listMarkdownQuestionFiles(sourceRoot);
  const topicsById = new Map();
  const missingRequiredSections = [];
  let totalScriptPairs = 0;
  let alignmentIssueCount = 0;

  for (const filePath of markdownFiles) {
    const relativePath = path.relative(sourceRoot, filePath);
    const [topicId, fileName] = relativePath.split(path.sep);
    const questionSlug = fileName.replace(/\.md$/, '');
    const questionId = `${topicId}/${questionSlug}`;
    const markdown = fs.readFileSync(filePath, 'utf8');
    const sections = extractSections(markdown);
    const missing = REQUIRED_SECTIONS.filter((section) => !sections[section]);

    if (missing.length > 0) {
      missingRequiredSections.push({ id: questionId, missing });
    }

    if (!topicsById.has(topicId)) {
      topicsById.set(topicId, {
        id: topicId,
        title: titleFromSlug(topicId),
        questions: []
      });
    }

    const question = parseQuestion(markdown, sections, topicId, questionSlug);
    totalScriptPairs += question.scriptPairs.length;
    if (question.hasAlignmentIssue) alignmentIssueCount += 1;
    topicsById.get(topicId).questions.push(question);
  }

  const topics = [...topicsById.values()].map((topic) => ({
    ...topic,
    questions: topic.questions.sort((a, b) => a.order - b.order)
  }));

  const questionCount = topics.reduce((sum, topic) => sum + topic.questions.length, 0);

  return {
    datasetDate: path.basename(sourceRoot),
    sourcePath: path.relative(path.resolve(appRoot, '../..'), sourceRoot),
    generatedAt: new Date().toISOString(),
    topics,
    stats: {
      topicCount: topics.length,
      questionCount,
      totalScriptPairs,
      alignedQuestionCount: questionCount - alignmentIssueCount,
      alignmentIssueCount,
      missingRequiredSections
    }
  };
}

export function writeStudyData({
  sourceRoot = defaultSourceRoot,
  outputPath = defaultOutputPath
} = {}) {
  const data = buildStudyDataFromDirectory(sourceRoot);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  return data;
}

export function listMarkdownQuestionFiles(sourceRoot) {
  const topicDirs = fs
    .readdirSync(sourceRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  return topicDirs.flatMap((topicDir) => {
    const dirPath = path.join(sourceRoot, topicDir);
    return fs
      .readdirSync(dirPath, { withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
      .map((entry) => path.join(dirPath, entry.name))
      .sort();
  });
}

export function parseQuestion(markdown, sections, topicId, questionSlug) {
  const h1 = markdown.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? titleFromSlug(questionSlug);
  const prompt = parsePrompt(sections['문제'] ?? '');
  const koLines = splitContentLines(sections['한국어 전문'] ?? '');
  const enLines = splitContentLines(sections['영어 전문'] ?? '');
  const hasAlignmentIssue = koLines.length !== enLines.length;
  const pairCount = hasAlignmentIssue ? Math.max(koLines.length, enLines.length) : koLines.length;

  return {
    id: `${topicId}/${questionSlug}`,
    topicId,
    slug: questionSlug,
    order: orderFromSlug(questionSlug),
    title: cleanQuestionTitle(h1),
    promptKo: prompt.ko,
    promptEn: prompt.en,
    flowPoints: parseBulletLines(sections['암기 포인트 및 흐름'] ?? ''),
    scriptPairs: Array.from({ length: pairCount }, (_, index) => ({
      id: `s${index + 1}`,
      index: index + 1,
      ko: koLines[index] ?? '',
      en: enLines[index] ?? '',
      status: hasAlignmentIssue ? 'needs-review' : 'aligned'
    })),
    hasAlignmentIssue,
    keySentences: parseKeySentences(sections['키 문장 및 단어'] ?? ''),
    keyWords: parseKeyWords(sections['키 문장 및 단어'] ?? ''),
    keySentenceGroups: parseKeySentenceGroups(
      sections['키 한국어 문장 및 대응되는 영어표현 여러개'] ?? ''
    ),
    hooks: parseBulletLines(sections['Follow-up Hooks'] ?? '')
  };
}

export function extractSections(markdown) {
  const sections = {};
  const headingPattern = /^##\s+(.+?)\s*$/gm;
  const matches = [...markdown.matchAll(headingPattern)];

  matches.forEach((match, index) => {
    const title = match[1].trim();
    const start = match.index + match[0].length;
    const end = matches[index + 1]?.index ?? markdown.length;
    sections[title] = markdown.slice(start, end).trim();
  });

  return sections;
}

function parsePrompt(section) {
  const ko = section.match(/^-\s*한국어:\s*(.+)$/m)?.[1]?.trim() ?? '';
  const en = section.match(/^-\s*English:\s*(.+)$/m)?.[1]?.trim() ?? '';
  return { ko, en };
}

function parseKeySentences(section) {
  const keySentenceSection = section.match(/###\s+Key Sentences\s*([\s\S]*?)(?=###\s+Key Words|$)/)?.[1] ?? '';
  return parseBulletLines(keySentenceSection);
}

function parseKeyWords(section) {
  const keyWordSection = section.match(/###\s+Key Words\s*([\s\S]*)/)?.[1] ?? '';
  return parseBulletLines(keyWordSection).map((line) => {
    const [term, ...meaningParts] = line.split(/\s+:\s+/);
    return {
      term: term?.trim() ?? line,
      meaning: meaningParts.join(' : ').trim()
    };
  });
}

function parseKeySentenceGroups(section) {
  const groups = [];
  let current = null;

  for (const rawLine of section.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;

    if (line.startsWith('### ')) {
      const ko = line.replace(/^###\s+/, '').trim();
      if (current?.variants.length) {
        groups.push(current);
        current = null;
      }
      if (!current) {
        current = { id: `k${groups.length + 1}`, ko, koAlternatives: [ko], variants: [] };
      } else if (!current.koAlternatives.includes(ko)) {
        current.koAlternatives.push(ko);
      }
      continue;
    }

    const bullet = line.match(/^-\s+(.+)$/)?.[1]?.trim();
    if (bullet && current) {
      current.variants.push(bullet);
    }
  }

  if (current?.variants.length) groups.push(current);
  return groups;
}

function splitContentLines(section) {
  return section
    .split(/\r?\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function parseBulletLines(section) {
  return section
    .split(/\r?\n/)
    .map((line) => line.trim().replace(/^-\s+/, ''))
    .filter(Boolean);
}

function orderFromSlug(slug) {
  return Number(slug.match(/^q(\d+)/)?.[1] ?? 999);
}

function titleFromSlug(slug) {
  return slug
    .replace(/^\d+-/, '')
    .replace(/^q\d+-/, '')
    .split('-')
    .map((part) => part.toUpperCase() === 'it' ? 'IT' : part[0].toUpperCase() + part.slice(1))
    .join(' ');
}

function cleanQuestionTitle(title) {
  return title.includes(' - ') ? title.split(' - ').at(-1).trim() : title;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const data = writeStudyData();
  console.log(
    `Generated ${data.stats.questionCount} questions across ${data.stats.topicCount} topics at ${path.relative(process.cwd(), defaultOutputPath)}`
  );
}

