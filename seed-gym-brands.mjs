import { initializeApp } from 'firebase/app'
import {
  getFirestore,
  collection,
  getDocs,
  writeBatch,
  doc,
  query,
} from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyBfAJrW9d0coI1RkmpFXmObRlyvJcm9oto',
  authDomain: 'climb-d7ba9.firebaseapp.com',
  projectId: 'climb-d7ba9',
}

const SEED_BRANDS = [
  {
    name: '더클라임',
    colors: [
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
    ],
    gymNames: ['더클라임', '더클라임 연남', '더클라임 홍대B', '더클라임 신사', '더클라임 강남', '더클라임 신논현'],
    order: 1,
  },
  {
    name: '서울숲',
    colors: [
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
    ],
    gymNames: ['서울숲', '서울숲 성수', '서울숲 잠실', '서울숲 종로'],
    order: 2,
  },
  {
    name: '클라임바운스',
    colors: [
      { label: '흰색',   hex: '#ffffff', level: 1 },
      { label: '분홍색', hex: '#ec4899', level: 2 },
      { label: '노란색', hex: '#facc15', level: 3 },
      { label: '초록색', hex: '#22c55e', level: 4 },
      { label: '파란색', hex: '#3b82f6', level: 5 },
      { label: '남색',   hex: '#3730a3', level: 6 },
      { label: '빨간색', hex: '#ef4444', level: 7 },
      { label: '갈색',   hex: '#92400e', level: 8 },
      { label: '검정색', hex: '#1f2937', level: 9 },
    ],
    gymNames: ['클라임바운스', '클라임바운스 이천', '클라임바운스 창전', '클라임바운스 수원'],
    order: 3,
  },
]

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

const snap = await getDocs(query(collection(db, 'gymBrands')))

if (!snap.empty) {
  console.log(`gymBrands 컬렉션에 이미 ${snap.size}개 문서가 있습니다. 스킵합니다.`)
  process.exit(0)
}

const batch = writeBatch(db)
SEED_BRANDS.forEach((brand) => {
  batch.set(doc(collection(db, 'gymBrands')), brand)
})
await batch.commit()

console.log(`✅ gymBrands 시드 완료: ${SEED_BRANDS.map(b => b.name).join(', ')}`)
process.exit(0)
