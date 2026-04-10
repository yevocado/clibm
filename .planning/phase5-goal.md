# Phase 5 — 목표 설정

## 목표
목표 V등급과 기한을 설정하고, 현재 최고 기록 대비 달성률을 트래킹한다.

## 구현 파일
- `src/hooks/useGoals.js` — Firestore CRUD (users/{uid}/goals)
- `src/pages/GoalPage.jsx` — 목표 설정 + 달성률

## 데이터 구조
```
users/{uid}/goals/{id}
  - targetVGrade: string (e.g. "V5")
  - deadline: string (YYYY-MM-DD)
  - achieved: boolean
  - createdAt: timestamp
```

## 기능
- 목표 V등급 + 기한 설정
- 현재 최고 V등급 자동 계산 (climbs에서)
- Progress bar (현재/목표)
- 달성 시 축하 표시
- 목표 삭제/수정
