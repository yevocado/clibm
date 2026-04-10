# Phase 3 — 암장 방문 기록

## 목표
암장 방문 날짜를 기록하고, 월별/암장별 방문 횟수를 조회할 수 있다.

## 구현 파일
- `src/hooks/useVisits.js` — Firestore CRUD (users/{uid}/visits)
- `src/components/visits/VisitForm.jsx` — 방문 기록 추가 폼
- `src/pages/VisitsPage.jsx` — 목록 + 통계

## 데이터 구조
```
users/{uid}/visits/{id}
  - date: string (YYYY-MM-DD)
  - gymId: string
  - gymName: string
  - memo: string
  - createdAt: timestamp
```

## 기능
- 날짜, 암장, 메모 입력
- 이번달 방문 횟수 카운트 표시
- 월별 그룹핑 목록
- 방문 삭제
