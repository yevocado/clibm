import { useRef, useState } from 'react'
import html2canvas from 'html2canvas'
import { Camera, Video } from 'lucide-react'
import ShareCard from './ShareCard'
import CameraOverlay from './CameraOverlay'

function buildGymGroups(todayClimbs, gyms) {
  // gymId 기준으로 묶기
  const gymMap = {}
  todayClimbs.forEach((c) => {
    if (!gymMap[c.gymId]) {
      gymMap[c.gymId] = { gymName: c.gymName, colorMap: {} }
    }
    const key = c.gradeLevel
    if (!gymMap[c.gymId].colorMap[key]) {
      gymMap[c.gymId].colorMap[key] = {
        level: c.gradeLevel,
        label: c.grade,
        hex: c.gradeColor,
        count: 0,
      }
    }
    gymMap[c.gymId].colorMap[key].count += (c.count ?? 1)
  })

  return Object.values(gymMap).map((g) => ({
    gymName: g.gymName,
    colors: Object.values(g.colorMap).sort((a, b) => a.level - b.level),
  }))
}

export default function DailyShareButton({ todayClimbs, todayVisits = [] }) {
  const cardRef = useRef(null)
  const [saving, setSaving] = useState(false)
  const [showCamera, setShowCamera] = useState(false)

  const today = new Date().toISOString().slice(0, 10)
  const gymGroups = buildGymGroups(todayClimbs, [])

  if (todayClimbs.length === 0 && todayVisits.length === 0) return null

  const handleSave = async () => {
    if (!cardRef.current || saving) return
    setSaving(true)
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        backgroundColor: null,
        useCORS: true,
        logging: false,
      })

      canvas.toBlob(async (blob) => {
        const file = new File([blob], `유리의벽_${today}.png`, { type: 'image/png' })

        // Web Share API (모바일 갤러리 저장)
        if (navigator.canShare?.({ files: [file] })) {
          try {
            await navigator.share({ files: [file], title: '유리의 벽 — 오늘의 완등' })
          } catch (e) {
            if (e.name !== 'AbortError') fallbackDownload(blob, today)
          }
        } else {
          fallbackDownload(blob, today)
        }
        setSaving(false)
      }, 'image/png')
    } catch (e) {
      console.error(e)
      setSaving(false)
    }
  }

  return (
    <>
      {/* 오프스크린 카드 (캡처용) */}
      <div
        style={{
          position: 'fixed',
          top: -9999,
          left: -9999,
          pointerEvents: 'none',
          zIndex: -1,
        }}
      >
        <ShareCard ref={cardRef} date={today} gymGroups={gymGroups} todayVisits={todayVisits} />
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="btn-secondary w-full flex items-center justify-center gap-2"
        style={{ height: 48 }}
      >
        <Camera size={18} />
        {saving ? '저장 중…' : '오늘 기록 이미지로 저장'}
      </button>

      <button
        onClick={() => setShowCamera(true)}
        className="btn-secondary w-full flex items-center justify-center gap-2"
        style={{ height: 48 }}
      >
        <Video size={18} />
        카메라에 기록 띄우기
      </button>

      {showCamera && (
        <CameraOverlay gymGroups={gymGroups} todayVisits={todayVisits} onClose={() => setShowCamera(false)} />
      )}
    </>
  )
}

function fallbackDownload(blob, date) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `유리의벽_${date}.png`
  a.click()
  URL.revokeObjectURL(url)
}
