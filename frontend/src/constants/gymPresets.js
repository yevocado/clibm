const THE_CLIMB_COLORS = [
  { label: '흰색',   hex: '#ffffff', level: 1 },
  { label: '노란색', hex: '#facc15', level: 2 },
  { label: '주황색', hex: '#f97316', level: 3 },
  { label: '초록색', hex: '#22c55e', level: 4 },
  { label: '파란색', hex: '#3b82f6', level: 5 },
  { label: '빨간색', hex: '#ef4444', level: 6 },
  { label: '분홍색', hex: '#ec4899', level: 7 },
  { label: '보라색', hex: '#a855f7', level: 8 },
  { label: '회색',   hex: '#6b7280', level: 9 },
  { label: '갈색',   hex: '#92400e', level: 10 },
  { label: '검은색', hex: '#1f2937', level: 11 },
]

const SEOUL_SUP_COLORS = [
  { label: '빨간색', hex: '#ef4444', level: 1 },
  { label: '주황색', hex: '#f97316', level: 2 },
  { label: '노란색', hex: '#facc15', level: 3 },
  { label: '연두색', hex: '#84cc16', level: 4 },
  { label: '하늘색', hex: '#38bdf8', level: 5 },
  { label: '파란색', hex: '#3b82f6', level: 6 },
  { label: '보라색', hex: '#a855f7', level: 7 },
  { label: '갈색',   hex: '#92400e', level: 8 },
  { label: '검은색', hex: '#1f2937', level: 9 },
  { label: '분홍색', hex: '#ec4899', level: 10 },
]

const CLIMBOUNCE_COLORS = [
  { label: '흰색',   hex: '#ffffff', level: 1 },
  { label: '분홍색', hex: '#ec4899', level: 2 },
  { label: '노란색', hex: '#facc15', level: 3 },
  { label: '초록색', hex: '#22c55e', level: 4 },
  { label: '파란색', hex: '#3b82f6', level: 5 },
  { label: '남색',   hex: '#3730a3', level: 6 },
  { label: '빨간색', hex: '#ef4444', level: 7 },
  { label: '갈색',   hex: '#92400e', level: 8 },
  { label: '검정색', hex: '#1f2937', level: 9 },
]

export const GYM_PRESETS = [
  { name: '더클라임',      defaultGradeSystem: 'color', colors: THE_CLIMB_COLORS },
  { name: '더클라임 연남', defaultGradeSystem: 'color', colors: THE_CLIMB_COLORS },
  { name: '더클라임 홍대B', defaultGradeSystem: 'color', colors: THE_CLIMB_COLORS },
  { name: '더클라임 신사', defaultGradeSystem: 'color', colors: THE_CLIMB_COLORS },
  { name: '더클라임 강남', defaultGradeSystem: 'color', colors: THE_CLIMB_COLORS },
  { name: '더클라임 신논현', defaultGradeSystem: 'color', colors: THE_CLIMB_COLORS },
  {
    name: '서울숲',
    defaultGradeSystem: 'color',
    colors: SEOUL_SUP_COLORS,
  },
  { name: '서울숲 성수', defaultGradeSystem: 'color', colors: SEOUL_SUP_COLORS },
  { name: '서울숲 잠실', defaultGradeSystem: 'color', colors: SEOUL_SUP_COLORS },
  { name: '서울숲 종로', defaultGradeSystem: 'color', colors: SEOUL_SUP_COLORS },
  { name: '클라임바운스',      defaultGradeSystem: 'color', colors: CLIMBOUNCE_COLORS },
  { name: '클라임바운스 이천', defaultGradeSystem: 'color', colors: CLIMBOUNCE_COLORS },
  { name: '클라임바운스 창전', defaultGradeSystem: 'color', colors: CLIMBOUNCE_COLORS },
  { name: '클라임바운스 수원', defaultGradeSystem: 'color', colors: CLIMBOUNCE_COLORS },
]
