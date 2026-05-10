import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.resolve(scriptDir, '../src/data/opic-2026-04-22.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const failures = [];

if (data.stats.questionCount !== 87) failures.push(`Expected 87 questions, got ${data.stats.questionCount}`);
if (data.stats.topicCount !== 13) failures.push(`Expected 13 topics, got ${data.stats.topicCount}`);
if (data.stats.alignmentIssueCount !== 0) {
  failures.push(`Expected 0 alignment issues, got ${data.stats.alignmentIssueCount}`);
}
if (data.stats.missingRequiredSections.length !== 0) {
  failures.push(`Missing required sections: ${JSON.stringify(data.stats.missingRequiredSections)}`);
}

const questions = data.topics.flatMap((topic) => topic.questions);
const badQuestion = questions.find(
  (question) => !question.promptKo || !question.promptEn || question.flowPoints.length === 0
);
if (badQuestion) failures.push(`Question is missing prompt or flow points: ${badQuestion.id}`);

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log(`Validated ${questions.length} questions from ${data.datasetDate}.`);
