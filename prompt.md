# Personalized Prompt for OpenCode OPIc Topic Folder Pack

## 목적
당신은 OPIc 스크립트 작성 전용 코치다.
아래의 고정 페르소나, survey 조합, 문제 유형 마스터 리스트를 기준으로 **난이도 5~6에서 실제로 말하기 쉬운 OPIc 학습 파일 세트**를 만들어라.

이번 결과물의 최우선 목표는 다음 5가지다.
1. 답변의 자연스러움
2. 암기 용이성
3. **주제별 폴더 생성**
4. **각 문제를 개별 `.md` 파일로 저장**
5. 한국어↔영어 대응 학습 효율

즉, **한 번에 긴 답변을 출력하는 것보다, topic 폴더 안에 문제별 학습 파일을 체계적으로 저장하는 것**이 더 중요하다.

---

## 화자 고정 페르소나
- 한국인 IT 엔지니어다.
- 주 업무는 레거시 시스템 마이그레이션, 시스템 개선, AI 에이전트 관련 업무다.
- 가족과 함께 아파트 또는 공동주택에 거주한다.
- 평소 여가/취미는 영화/공연/콘서트, 카페 가기, 공원 산책/걷기/조깅, 드라이브, 음악 감상, 전략 게임, 국내 여행 또는 집에서 쉬는 휴가를 포함한다.
- 답변은 실제 한국 직장인이 말할 법한 현실적인 경험과 루틴을 기반으로 해야 한다.
- 너무 화려한 영어보다 자연스럽고 안정적인 spoken English를 선호한다.
- 긴 문장을 즉석에서 조립하기보다, 짧고 재사용 가능한 이야기 자산 중심으로 말하는 타입으로 설계한다.

---

## 전역 생성 규칙

### 1. 저장 구조 규칙
결과는 반드시 `outputs/opic/YYYY-MM-DD/` 아래에 저장한다.

최상위에는 아래 파일을 둔다.
- `00-index.md`
- `00-persona-sheet.md`
- `00-story-asset-bank.md`
- `90-study-plan.md` (권장)

주제는 반드시 **폴더**로 만든다.
각 주제 폴더 내부에는 **각 문제를 개별 `.md` 파일**로 저장한다.

기본 구조는 다음을 따른다.

```text
outputs/opic/YYYY-MM-DD/
├─ 00-index.md
├─ 00-persona-sheet.md
├─ 00-story-asset-bank.md
├─ 01-self-intro/
│  └─ q01-self-intro.md
├─ 02-work-it-software/
│  ├─ q01-company-and-role.md
│  ├─ q02-daily-work-routine.md
│  ├─ q03-past-vs-present.md
│  ├─ q04-problem-solving.md
│  ├─ q05-industry-trends.md
│  └─ q06-social-issues.md
├─ 03-home-apartment/
│  ├─ q01-home-layout.md
│  ├─ q02-home-routine.md
│  ├─ q03-past-vs-present.md
│  ├─ q04-home-problem-solving.md
│  └─ q05-housing-issues.md
├─ 04-movies-performances-concerts/
│  ├─ q01-preference.md
│  ├─ q02-viewing-routine.md
│  ├─ q03-past-vs-present.md
│  ├─ q04-memorable-experience.md
│  └─ q05-industry-trends.md
├─ 05-cafe/
│  ├─ q01-place-description.md
│  ├─ q02-visit-routine.md
│  ├─ q03-past-vs-present.md
│  └─ q04-memorable-experience.md
├─ 06-park-walking-jogging/
│  ├─ q01-place-and-course.md
│  ├─ q02-preparation-and-routine.md
│  ├─ q03-past-vs-present.md
│  ├─ q04-memorable-experience.md
│  └─ q05-health-trends.md
├─ 07-drive/
│  ├─ q01-destination.md
│  ├─ q02-in-car-routine.md
│  ├─ q03-past-vs-present.md
│  └─ q04-problem-solving.md
├─ 08-music/
│  ├─ q01-preference.md
│  ├─ q02-listening-routine.md
│  ├─ q03-past-vs-present.md
│  ├─ q04-memorable-experience.md
│  └─ q05-industry-trends.md
├─ 09-strategy-games/
│  ├─ q01-game-description.md
│  ├─ q02-play-routine.md
│  ├─ q03-past-vs-present.md
│  └─ q04-memorable-experience.md
├─ 10-vacation/
│  ├─ q01-preferred-place.md
│  ├─ q02-planning-and-routine.md
│  ├─ q03-past-vs-present.md
│  └─ q04-problem-solving.md
├─ 11-roleplay/
│  ├─ q11-ask-questions.md
│  ├─ q12-problem-and-alternatives.md
│  └─ q13-similar-experience.md
├─ 12-surprise-topics/
│  ├─ q01-recycling.md
│  ├─ q02-internet-and-devices.md
│  ├─ q03-weather-and-seasons.md
│  ├─ q04-holidays.md
│  └─ q05-public-places.md
└─ 90-study-plan.md
```

일부 topic만 요청하면 해당 topic 폴더만 만들되, 가능하면 `00-index.md`는 함께 갱신한다.

### 2. 각 문제 파일의 필수 섹션
**각 question `.md` 파일**에는 아래 섹션이 반드시 들어가야 한다.

## 암기 포인트 및 흐름
## 한국어 전문
## 영어 전문
## 키 문장 및 단어
## 키 한국어 문장 및 대응되는 영어표현 여러개

추가로 아래 섹션을 넣어도 된다.
- Follow-up Hooks
- Shadowing Lines
- Risky Expressions → Easier Alternatives
- Reusable Story Asset Tags
- Quick Answer Version

### 3. 줄바꿈 / 가독성 규칙
- heading 사이에는 빈 줄을 둔다.
- 한국어 전문 / 영어 전문은 문단을 짧게 끊는다.
- 한 문단에 문장을 너무 많이 몰아넣지 않는다.
- expression bank는 bullet list로 정리한다.
- 같은 의미의 여러 영어표현은 한 줄에 몰아쓰지 말고 줄바꿈해서 제시한다.
- 각 question 파일은 프린트해서 보아도 눈에 잘 들어와야 한다.

### 4. 영어 난이도 규칙
- 문장 길이는 짧고 명확하게 유지한다.
- 한 문장에는 하나의 핵심 아이디어만 담는다.
- 과도한 고급 어휘, 긴 종속절, 에세이형 표현은 피한다.
- 현재형, 과거형, 쉬운 연결어를 우선 사용한다.
- 말하기 쉬움이 문장 멋있음보다 우선이다.

### 5. 일관성 규칙
- 모든 topic에서 같은 사람처럼 들려야 한다.
- 직업, 생활 패턴, 취향, 주말 루틴, 말투가 서로 충돌하면 안 된다.
- 문항마다 새로운 인생을 만들지 말고, 재사용 가능한 핵심 스토리 8~12개를 돌려 쓴다.

### 6. 생성 우선순위 규칙
질문 유형이 많더라도 아래 순서를 우선한다.
1. 자기소개
2. 직장/업무
3. 거주지
4. 카페
5. 공원/걷기/조깅
6. 롤플레이
7. 돌발 주제
8. 나머지 취미/여가 주제

### 7. 품질 보정 규칙
각 question 파일을 저장하기 전에 아래를 확인한다.
- 한국어와 영어가 의미상 정렬되어 있는가
- 암기 흐름이 opening → detail → episode → feeling 구조를 갖는가
- 핵심 한국어 문장마다 영어 대안 표현이 2~4개 있는가
- 키 단어가 너무 어렵지 않은가
- 줄바꿈이 과도하게 빽빽하지 않은가

---

## Survey 조합
- 직장/업무: IT/소프트웨어 분야
- 거주지: 가족과 함께 아파트/주택 거주
- 여가 활동: 영화 / 공연 / 콘서트 보기
- 여가 활동: 카페 가기
- 여가/운동: 공원 가기 / 걷기 / 조깅
- 여가 활동: 드라이브 하기
- 취미: 음악 감상하기
- 취미: 게임 하기(전략 게임)
- 휴가: 국내 여행 / 집에서 보내는 휴가
- 롤플레이: 약속 잡기, 예약, 일정 변경, 문제 해결
- 돌발 주제: 재활용, 인터넷/전자기기, 날씨/계절, 명절, 은행/식당/병원

---

## 문제 유형 마스터 리스트
### 0. 공통 (1번)
1. 자기소개

### 1. 직장/업무 (IT/소프트웨어)
1. 회사 및 역할 묘사
2. 일상 업무 루틴
3. 과거와 현재 비교
4. 문제 해결 경험
5. 산업 동향
6. 사회적 이슈

### 2. 거주지 - 가족과 함께 아파트/주택 거주
1. 집 구조 묘사
2. 집에서의 루틴
3. 과거와 현재 비교
4. 문제 해결 경험
5. 거주지 이슈

### 3. 영화 / 공연 / 콘서트 보기
1. 취향 묘사
2. 관람 루틴
3. 과거와 현재 비교
4. 기억에 남는 경험
5. 산업 이슈

### 4. 카페 가기
1. 장소 묘사
2. 방문 루틴
3. 과거와 현재 비교
4. 기억에 남는 경험

### 5. 공원 가기 / 걷기 / 조깅
1. 장소 및 코스 묘사
2. 준비 및 루틴
3. 과거와 현재 비교
4. 기억에 남는 경험
5. 건강 트렌드

### 6. 드라이브 하기
1. 목적지 묘사
2. 차내 루틴
3. 과거와 현재 비교
4. 문제 해결 경험

### 7. 음악 감상하기
1. 취향 묘사
2. 감상 루틴
3. 과거와 현재 비교
4. 기억에 남는 경험
5. 산업 이슈

### 8. 게임 하기 (전략 게임)
1. 게임 묘사
2. 플레이 루틴
3. 과거와 현재 비교
4. 기억에 남는 경험

### 9. 휴가 - 국내 여행 / 집에서 보내는 휴가
1. 선호 장소 묘사
2. 계획 및 루틴
3. 과거와 현재 비교
4. 문제 해결 경험

### 10. 롤플레이 (11, 12, 13번)
1. 상황 파악 및 질문하기
2. 문제 발생 및 대안 제시
3. 유사 경험 설명

### 11. 돌발 주제
1. 재활용
2. 인터넷 및 전자기기
3. 날씨와 계절
4. 명절
5. 은행 / 식당 / 병원

---

## 각 question 파일 작성 템플릿
각 문제 파일은 아래 틀을 따른다.

# [Topic Name] - [Question Name]

## 암기 포인트 및 흐름
- Opening
- Main detail
- Routine or comparison point
- Episode or problem
- Feeling / lesson
- Closing

## 한국어 전문
[짧은 문단 단위로 끊어서 작성]

## 영어 전문
[짧은 문단 단위로 끊어서 작성]

## 키 문장 및 단어
### Key Sentences
- [핵심 영어 문장]
- [핵심 영어 문장]

### Key Words
- [단어] : [짧은 뜻]
- [단어] : [짧은 뜻]

## 키 한국어 문장 및 대응되는 영어표현 여러개
### 한국어 문장 1
- English variant 1
- English variant 2
- English variant 3

### 한국어 문장 2
- English variant 1
- English variant 2

## 생성 요청
위 규칙에 따라 전체 pack을 생성하고 저장하라.
절대로 topic 하나당 파일 하나로 끝내지 말고,
**topic 폴더 내부에 question별 markdown 파일**로 저장하라.
