# Design System

> Pretendard · Neutral Pink · Minimal

---

## 1. Color Palette

### Primary — Pink

| Token | Hex | 용도 |
|-------|-----|------|
| `pink-50` | `#FBF0F4` | 배경, hover fill, badge bg |
| `pink-100` | `#F4C0D1` | 라이트 보더, 선택 상태 |
| `pink-150` | `#EDD0DC` | 인풋 보더, 디바이더 |
| `pink-200` | `#ED93B1` | 비활성 강조, 아이콘 |
| `pink-300` | `#D88CA6` | **Primary button bg** |
| `pink-400` | `#D4537E` | hover 상태, 링크 |
| `pink-500` | `#B5607E` | badge text, strong 강조 |
| `pink-600` | `#993556` | 다크 강조, 오버레이 텍스트 |

### Neutral — Warm Gray

| Token | Hex | 용도 |
|-------|-----|------|
| `neutral-50` | `#F5F3F0` | 페이지 배경 |
| `neutral-100` | `#D3D1C7` | 비활성 보더 |
| `neutral-400` | `#888780` | 보조 텍스트 |
| `neutral-800` | `#444441` | 본문 텍스트 (다크) |

### Semantic

| 역할 | Token | 비고 |
|------|-------|------|
| 텍스트 (기본) | `var(--color-text-primary)` | |
| 텍스트 (보조) | `var(--color-text-secondary)` | |
| 텍스트 (힌트) | `var(--color-text-tertiary)` | |
| 보더 (기본) | `var(--color-border-tertiary)` | |
| 배경 (서피스) | `var(--color-background-primary)` | |
| 배경 (서브) | `var(--color-background-secondary)` | |

---

## 2. Typography

**Font family:** `Pretendard` (fallback: `-apple-system, sans-serif`)

```css
font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
```

### Type Scale

| 이름 | Size | Weight | Line Height | 용도 |
|------|------|--------|-------------|------|
| `h1` | 32px | 700 | 1.25 | 페이지 타이틀 |
| `h2` | 24px | 600 | 1.35 | 섹션 제목 |
| `h3` | 18px | 600 | 1.4 | 카드/모달 제목 |
| `body` | 15px | 400 | 1.7 | 기본 본문 |
| `small` | 13px | 400 | 1.6 | 보조 설명, 날짜 |
| `label` | 11px | 500 | 1.0 | 섹션 레이블 (uppercase + letter-spacing: 0.08em) |

---

## 3. Spacing Scale

Base unit: `4px`

| Token | Size | 용도 |
|-------|------|------|
| `spacing-1` | 4px | 아이콘 내부 간격 |
| `spacing-2` | 8px | 컴팩트 패딩, gap |
| `spacing-3` | 12px | 버튼 내부 수직 패딩 |
| `spacing-4` | 16px | 카드 패딩, 컴포넌트 gap |
| `spacing-6` | 24px | 섹션 내 여백 |
| `spacing-8` | 32px | 카드 간격, 섹션 시작 |
| `spacing-12` | 48px | 섹션 간격 |
| `spacing-16` | 64px | 페이지 레벨 여백 |

---

## 4. Border Radius

| Token | Size | 용도 |
|-------|------|------|
| `radius-xs` | 4px | 배지, 태그, 소형 요소 |
| `radius-md` | 8px | 버튼, 인풋, 소형 카드 |
| `radius-lg` | 12px | 카드, 모달 |
| `radius-xl` | 16px | 시트, 바텀 드로어 |
| `radius-full` | 9999px | 칩, 아바타, 라운드 버튼 |

---

## 5. Components

### Button

```css
/* Primary */
background: #D88CA6;
color: #fff;
border: none;
border-radius: 8px;
padding: 10px 20px;
font-size: 14px;
font-weight: 500;

/* Secondary */
background: transparent;
color: #D88CA6;
border: 1.5px solid #D88CA6;
border-radius: 8px;
padding: 10px 20px;

/* Ghost */
background: #FBF0F4;
color: #B5607E;
border: none;
border-radius: 8px;
padding: 10px 20px;
```

**상태 규칙**
- `hover`: Primary → `#D4537E`, Secondary border → `#D4537E`
- `disabled`: opacity `0.4`, cursor `not-allowed`
- `focus-visible`: `box-shadow: 0 0 0 3px rgba(216,140,166,0.3)`

---

### Input

```css
border: 1px solid #EDD0DC;
border-radius: 8px;
padding: 10px 14px;
font-size: 14px;
font-family: 'Pretendard', sans-serif;
background: var(--color-background-primary);

/* focus */
border-color: #D88CA6;
box-shadow: 0 0 0 3px rgba(216,140,166,0.15);
```

---

### Card

```css
background: var(--color-background-primary);
border: 0.5px solid #EDD0DC;
border-radius: 12px;
padding: 20px;
```

---

### Badge / Tag

| 종류 | Background | Text color |
|------|-----------|------------|
| Pink (filled) | `#FBF0F4` | `#B5607E` |
| Neutral | `var(--color-background-secondary)` | `var(--color-text-secondary)` |
| Outline | `transparent` | `#D88CA6`, border `#EDD0DC` |

```css
font-size: 11px;
font-weight: 500;
border-radius: 4px;
padding: 3px 10px;
```

---

## 6. Layout Rules

### Max Width

| 컨텍스트 | Max Width |
|---------|-----------|
| 페이지 컨텐츠 | `720px` |
| 카드 그리드 | `100%` (grid) |
| 모달 | `480px` |
| 바텀 시트 | `100%` |

### Grid

```css
/* 기본 2열 카드 그리드 */
display: grid;
grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
gap: 16px;
```

### Z-index

| 레이어 | Value |
|--------|-------|
| 기본 콘텐츠 | `0` |
| 드롭다운 | `100` |
| 오버레이 | `200` |
| 모달 | `300` |
| 토스트 | `400` |

---

## 7. Design Rules

- **핑크는 강조에만** — 기본 텍스트와 레이아웃은 뉴트럴. 핑크는 CTA, 선택 상태, 배지에 집중 사용.
- **여백 우선** — 좁은 여백보다 넉넉한 여백. 기본 섹션 gap은 `48px`.
- **보더는 연하게** — `0.5px` 또는 `1px`, 색상은 `pink-150` 또는 `--color-border-tertiary`.
- **텍스트 위계** — H1/H2/H3 + body + small + label, 최대 3단계만 한 화면에 혼용.
- **폰트 웨이트** — 400 (본문), 500 (레이블/버튼), 600 (제목), 700 (히어로 타이틀)만 사용.
- **다크모드** — CSS 변수 기반으로 구현. 하드코딩 hex는 pink 팔레트 내에서만 허용.