# 유리의 벽 (Yuri's Wall) - 클라이밍 트래킹 웹앱

## 프로젝트 개요
임유리를 위한 개인 클라이밍 루트 트래킹 웹앱.
한국 실내 볼더링 암장(더클라임 등) 기반의 기록/성장 관리 서비스.

## 기술 스택
- **Frontend**: React
- **Database**: Firebase Firestore
- **차트**: Recharts
- **폰트**: Pretendard (한글+영문 통합)
- **스타일링**: CSS / Tailwind

## 핵심 기능
1. **루트 완등 기록** — 날짜, 난이도(색상/V등급), 암장명, 메모
2. **암장 방문 기록** — 방문 날짜, 암장명, 방문 횟수 집계
3. **실력 성장 그래프** — 기간별 최고 난이도 추이 (Recharts)
4. **목표 설정** — 목표 난이도 설정 및 달성률 트래킹

## 난이도 체계
- 한국 볼더링 V등급 사용 (V0~V10+)
- 암장별로 색상 체계가 다를 수 있으므로, 사용자가 직접 커스텀 가능하게 구현

## Firebase 설정
- 환경변수는 `.env` 파일에서 읽어옴 (절대 하드코딩 금지)
- `.env.example` 파일 제공

```
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=
REACT_APP_FIREBASE_STORAGE_BUCKET=
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=
REACT_APP_FIREBASE_APP_ID=
```

## Firestore 컬렉션 구조
```
climbs/          # 루트 완등 기록
  - date: string
  - grade: string        # 색상 (e.g. "파랑")
  - vGrade: string       # V등급 (e.g. "V3")
  - gymName: string
  - memo: string
  - createdAt: timestamp

gyms/            # 암장 방문 기록
  - name: string
  - visitDate: string
  - createdAt: timestamp

goals/           # 목표 설정
  - targetGrade: string
  - targetVGrade: string
  - deadline: string
  - achieved: boolean
  - createdAt: timestamp
```

## 디자인 원칙
- generic AI 느낌의 디자인 지양
- Bold한 타이포그래피, 클라이밍 감성의 컬러 팔레트
- 모바일 친화적 레이아웃 (암장에서 폰으로 기록하는 시나리오)
- Pretendard 폰트 적용

## 코드 컨벤션
- 컴포넌트: PascalCase
- 함수/변수: camelCase
- 파일명: kebab-case
- 한국어 주석 허용