---
name: opic-topic-file-spec
description: Defines the required topic-folder and question-file structure for OPIc outputs. Use when writing or reviewing saved markdown folders, question files, mandatory sections, and readability.
compatibility: opencode
metadata:
  category: opic
  purpose: file-output
---

## What it does
- Standardizes topic folder names and question file names
- Ensures one topic folder per topic
- Ensures one markdown file per question
- Enforces readable markdown formatting

## Root file set
At the root of `outputs/opic/YYYY-MM-DD/`, create:
- `00-index.md`
- `00-persona-sheet.md`
- `00-story-asset-bank.md`
- `90-study-plan.md` (optional but recommended)

## Required topic folders and question files

### `01-self-intro/`
- `q01-self-intro.md`

### `02-work-it-software/`
- `q01-company-and-role.md`
- `q02-daily-work-routine.md`
- `q03-past-vs-present.md`
- `q04-problem-solving.md`
- `q05-industry-trends.md`
- `q06-social-issues.md`

### `03-home-apartment/`
- `q01-home-layout.md`
- `q02-home-routine.md`
- `q03-past-vs-present.md`
- `q04-home-problem-solving.md`
- `q05-housing-issues.md`

### `04-movies-performances-concerts/`
- `q01-preference.md`
- `q02-viewing-routine.md`
- `q03-past-vs-present.md`
- `q04-memorable-experience.md`
- `q05-industry-trends.md`

### `05-cafe/`
- `q01-place-description.md`
- `q02-visit-routine.md`
- `q03-past-vs-present.md`
- `q04-memorable-experience.md`

### `06-park-walking-jogging/`
- `q01-place-and-course.md`
- `q02-preparation-and-routine.md`
- `q03-past-vs-present.md`
- `q04-memorable-experience.md`
- `q05-health-trends.md`

### `07-drive/`
- `q01-destination.md`
- `q02-in-car-routine.md`
- `q03-past-vs-present.md`
- `q04-problem-solving.md`

### `08-music/`
- `q01-preference.md`
- `q02-listening-routine.md`
- `q03-past-vs-present.md`
- `q04-memorable-experience.md`
- `q05-industry-trends.md`

### `09-strategy-games/`
- `q01-game-description.md`
- `q02-play-routine.md`
- `q03-past-vs-present.md`
- `q04-memorable-experience.md`

### `10-vacation/`
- `q01-preferred-place.md`
- `q02-planning-and-routine.md`
- `q03-past-vs-present.md`
- `q04-problem-solving.md`

### `11-roleplay/`
- `q11-ask-questions.md`
- `q12-problem-and-alternatives.md`
- `q13-similar-experience.md`

### `12-surprise-topics/`
- `q01-recycling.md`
- `q02-internet-and-devices.md`
- `q03-weather-and-seasons.md`
- `q04-holidays.md`
- `q05-public-places.md`

## Required question file sections
Every question file must contain:
- `## 암기 포인트 및 흐름`
- `## 한국어 전문`
- `## 영어 전문`
- `## 키 문장 및 단어`
- `## 키 한국어 문장 및 대응되는 영어표현 여러개`

## Recommended extras
- `## Follow-up Hooks`
- `## Shadowing Lines`
- `## Risky Expressions → Easier Alternatives`
- `## Reusable Story Asset Tags`
- `## Quick Answer Version`

## Formatting rules
- Use blank lines generously.
- Break long paragraphs into short blocks.
- Use clear heading levels.
- Put each Korean key sentence in its own mini block.
- Put each English variant on its own bullet line.
- Optimize for printing, scanning, and memorization.
