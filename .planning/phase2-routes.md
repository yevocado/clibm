# Phase 2 — 루트 완등 기록 ✅ 완료

## 목표
사용자가 클라이밍 루트 완등 기록을 추가/조회/삭제할 수 있다.

## 구현 파일
- `src/hooks/useClimbs.js` — Firestore CRUD (users/{uid}/climbs)
- `src/components/climbs/ClimbForm.jsx` — 완등 기록 추가 폼
- `src/components/climbs/ClimbCard.jsx` — 기록 카드 컴포넌트
- `src/pages/RoutesPage.jsx` — 목록 + 필터 + 추가

## 데이터 구조
```
users/{uid}/climbs/{id}
  - date: string (YYYY-MM-DD)
  - gymId: string
  - gymName: string
  - grade: string (색상 label, e.g. "파란색")
  - gradeColor: string (hex)
  - gradeLevel: number
  - vGrade: string (e.g. "V3")
  - memo: string
  - createdAt: timestamp
```

## 기능
- 날짜, 암장, 색상(암장 팔레트), V등급, 메모 입력
- 월별 그룹핑 목록
- 암장별 필터
- 완등 삭제 (confirm)
