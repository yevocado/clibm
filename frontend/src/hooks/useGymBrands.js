import { useState, useEffect } from 'react'
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  writeBatch,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  arrayRemove,
} from 'firebase/firestore'
import { db } from '../firebase'

const SEED_BRANDS = [
  {
    name: '더클라임',
    colors: [
      { label: '흰색',   hex: '#FFFFFF' },
      { label: '노란색', hex: '#FACC15' },
      { label: '주황색', hex: '#F97316' },
      { label: '초록색', hex: '#22C55E' },
      { label: '파란색', hex: '#3B82F6' },
      { label: '빨간색', hex: '#EF4444' },
      { label: '분홍색', hex: '#EC4899' },
      { label: '보라색', hex: '#A855F7' },
      { label: '회색',   hex: '#6B7280' },
      { label: '갈색',   hex: '#92400E' },
      { label: '검은색', hex: '#1F2937' },
    ],
    gymNames: ['더클라임', '더클라임 연남', '더클라임 홍대B', '더클라임 신사', '더클라임 강남', '더클라임 논현'],
    order: 1,
  },
  {
    name: '서울숲',
    colors: [
      { label: '빨간색', hex: '#EF4444' },
      { label: '주황색', hex: '#F97316' },
      { label: '노란색', hex: '#FACC15' },
      { label: '연두색', hex: '#84CC16' },
      { label: '하늘색', hex: '#38BDF8' },
      { label: '파란색', hex: '#3B82F6' },
      { label: '보라색', hex: '#A855F7' },
      { label: '갈색',   hex: '#92400E' },
      { label: '검은색', hex: '#1F2937' },
      { label: '분홍색', hex: '#EC4899' },
    ],
    gymNames: ['서울숲', '서울숲 성수', '서울숲 잠실', '서울숲 종로'],
    order: 2,
  },
  {
    name: '클라임바운스',
    colors: [
      { label: '흰색',   hex: '#FFFFFF' },
      { label: '분홍색', hex: '#EC4899' },
      { label: '노란색', hex: '#FACC15' },
      { label: '초록색', hex: '#22C55E' },
      { label: '파란색', hex: '#3B82F6' },
      { label: '남색',   hex: '#3730A3' },
      { label: '빨간색', hex: '#EF4444' },
      { label: '갈색',   hex: '#92400E' },
      { label: '검정색', hex: '#1F2937' },
    ],
    gymNames: ['클라임바운스', '클라임바운스 이천', '클라임바운스 창전', '클라임바운스 수원'],
    order: 3,
  },
  {
    name: '클라이밍파크',
    colors: [
      { label: '노란색', hex: '#FACC15' },
      { label: '분홍색', hex: '#EC4899' },
      { label: '파란색', hex: '#3B82F6' },
      { label: '빨간색', hex: '#EF4444' },
      { label: '보라색', hex: '#A855F7' },
      { label: '갈색',   hex: '#92400E' },
      { label: '하늘색', hex: '#38BDF8' },
      { label: '검은색', hex: '#1F2937' },
      { label: '흰색',   hex: '#FFFFFF' },
    ],
    gymNames: [],
    order: 4,
  },
]

// 기존 데이터 마이그레이션 목록 (구이름 → 신이름, 브랜드명 기준)
const RENAMES = {
  '더클라임': { '더클라임 신논현': '더클라임 논현' },
}

export function getBrandName(gymName, brands) {
  if (!gymName) return gymName
  return brands.find((b) => gymName.trim().startsWith(b.name))?.name ?? gymName
}

export function getBrandColors(brandId, brands) {
  return brands.find((b) => b.id === brandId)?.colors ?? []
}

export function useGymBrands() {
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'gymBrands'), orderBy('order', 'asc'))
    const unsub = onSnapshot(q, async (snap) => {
      if (snap.empty) {
        const batch = writeBatch(db)
        SEED_BRANDS.forEach((brand) => {
          batch.set(doc(collection(db, 'gymBrands')), brand)
        })
        await batch.commit()
        return
      }

      // 새 시드 브랜드 자동 추가
      const existingNames = new Set(snap.docs.map((d) => d.data().name))
      const missing = SEED_BRANDS.filter((b) => !existingNames.has(b.name))
      if (missing.length > 0) {
        const batch = writeBatch(db)
        missing.forEach((brand) => {
          batch.set(doc(collection(db, 'gymBrands')), brand)
        })
        await batch.commit()
        return
      }

      // gymNames 마이그레이션 (구→신 이름 변경)
      let migrated = false
      for (const d of snap.docs) {
        const data = d.data()
        const renames = RENAMES[data.name]
        if (!renames) continue
        const gymNames = data.gymNames ?? []
        let updated = gymNames
        for (const [oldName, newName] of Object.entries(renames)) {
          if (updated.includes(oldName)) {
            updated = updated.map((n) => n === oldName ? newName : n)
            migrated = true
          }
        }
        if (migrated) {
          await updateDoc(doc(db, 'gymBrands', d.id), { gymNames: updated })
        }
      }
      if (migrated) return

      setBrands(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsub
  }, [])

  const addBrand = async (data) => {
    const maxOrder = brands.reduce((max, b) => Math.max(max, b.order ?? 0), 0)
    await addDoc(collection(db, 'gymBrands'), { ...data, order: maxOrder + 1 })
  }

  const deleteBrand = async (brandId) => {
    await deleteDoc(doc(db, 'gymBrands', brandId))
  }

  const removeBranchFromBrand = async (brandId, gymName) => {
    await updateDoc(doc(db, 'gymBrands', brandId), { gymNames: arrayRemove(gymName) })
  }

  return { brands, loading, addBrand, deleteBrand, removeBranchFromBrand }
}
