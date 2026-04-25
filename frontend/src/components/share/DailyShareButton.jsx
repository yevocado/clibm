import { useRef, useState } from 'react'
import html2canvas from 'html2canvas'
import { Camera, Download } from 'lucide-react'
import ShareCard from './ShareCard'
import CameraOverlay from './CameraOverlay'


function buildGymGroups(todayClimbs) {
  const gymMap = {}
  todayClimbs.forEach((c) => {
    if (!gymMap[c.gymId]) {
      gymMap[c.gymId] = { gymName: c.gymName, colorMap: {} }
    }
    const key = c.gradeLevel
    if (!gymMap[c.gymId].colorMap[key]) {
      gymMap[c.gymId].colorMap[key] = {
        level: c.gradeLevel, label: c.grade, hex: c.gradeColor, count: 0,
      }
    }
    gymMap[c.gymId].colorMap[key].count += (c.count ?? 1)
  })
  return Object.values(gymMap).map((g) => ({
    gymName: g.gymName,
    colors: Object.values(g.colorMap).sort((a, b) => a.level - b.level),
  }))
}

async function saveImage(blob, date) {
  const file = new File([blob], `유리의벽_${date}.png`, { type: 'image/png' })
  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: '유리의 벽' })
      return
    } catch (e) {
      if (e.name === 'AbortError') return
    }
  }
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = file.name
  a.click()
  URL.revokeObjectURL(url)
}

export default function DailyShareButton({ todayClimbs, todayVisits = [], userName = '나' }) {
  const captureRef = useRef(null)
  const [saving, setSaving] = useState(false)
  const [showCamera, setShowCamera] = useState(false)

  const today = new Date().toISOString().slice(0, 10)
  const formattedDate = new Date(today + 'T00:00:00').toLocaleDateString('ko-KR', {
    month: 'long', day: 'numeric', weekday: 'short',
  })

  const gymGroups = buildGymGroups(todayClimbs)
  const totalCount = gymGroups.reduce((sum, g) => sum + g.colors.reduce((s, c) => s + c.count, 0), 0)

  if (todayClimbs.length === 0 && todayVisits.length === 0) return null

  const handleSave = async () => {
    if (!captureRef.current || saving) return
    setSaving(true)
    try {
      await document.fonts.ready
      const canvas = await html2canvas(captureRef.current, {
        scale: 3,
        backgroundColor: null,
        useCORS: true,
        logging: false,
      })
      canvas.toBlob(async (blob) => {
        await saveImage(blob, today)
        setSaving(false)
      }, 'image/png')
    } catch (e) {
      console.error(e)
      setSaving(false)
    }
  }

  return (
    <>
      {/* 오늘의 기록 카드 (화면에 표시) */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* 헤더 */}
        <div style={{
          background: 'linear-gradient(135deg, #D88CA6 0%, #993556 100%)',
          padding: '20px 20px 18px',
          color: '#fff',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <span style={{ fontSize: 13 }}>🧗</span>
                <span style={{ fontSize: 12, fontWeight: 600, opacity: 0.8, letterSpacing: '0.06em' }}>
                  {userName}의 벽
                </span>
              </div>
              <p style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.4, lineHeight: 1.2 }}>
                {formattedDate}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 32, fontWeight: 700, lineHeight: 1, color: 'rgba(255,255,255,0.95)' }}>
                {totalCount}
              </p>
              <p style={{ fontSize: 12, fontWeight: 500, opacity: 0.7, marginTop: 2 }}>총 완등</p>
            </div>
          </div>

          {/* 방문 암장 태그 */}
          {todayVisits.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
              {todayVisits.map((v) => (
                <span key={v.id} style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: 20, padding: '3px 12px',
                  fontSize: 12, fontWeight: 600,
                }}>
                  {v.gymName}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 암장별 색상 breakdown — 컴팩트 */}
        {gymGroups.length > 0 && (
          <div style={{ padding: '12px 20px' }}>
            {gymGroups.map((gym, i) => {
              const gymTotal = gym.colors.reduce((s, c) => s + c.count, 0)
              return (
                <div
                  key={gym.gymName}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    paddingBottom: i < gymGroups.length - 1 ? 10 : 0,
                    marginBottom: i < gymGroups.length - 1 ? 10 : 0,
                    borderBottom: i < gymGroups.length - 1 ? '0.5px solid #EDD0DC' : 'none',
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#444441', minWidth: 56, flexShrink: 0 }}>
                    {gym.gymName}
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, flex: 1 }}>
                    {gym.colors.map((c) => (
                      <div key={c.level} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <div style={{
                          width: 11, height: 11, borderRadius: '50%',
                          backgroundColor: c.hex, border: '0.5px solid #EDD0DC', flexShrink: 0,
                        }} />
                        <span style={{ fontSize: 12, color: '#444441', fontWeight: 500 }}>{c.count}</span>
                      </div>
                    ))}
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 600, color: '#B5607E',
                    background: '#FBF0F4', borderRadius: 4, padding: '2px 8px', flexShrink: 0,
                  }}>
                    {gymTotal}개
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {/* 액션 버튼 */}
        <div style={{
          display: 'flex', gap: 10, padding: '12px 20px 16px',
          borderTop: '0.5px solid #EDD0DC',
        }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              flex: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              height: 40, borderRadius: 8,
              border: '1px solid #EDD0DC',
              background: '#fff', color: '#444441',
              fontSize: 13, fontWeight: 500, cursor: saving ? 'default' : 'pointer',
              opacity: saving ? 0.6 : 1, transition: 'background 0.15s',
            }}
            onMouseEnter={e => { if (!saving) e.currentTarget.style.background = '#FBF0F4' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#fff' }}
          >
            <Download size={14} />
            {saving ? '저장 중…' : '이미지 저장'}
          </button>
          <button
            onClick={() => setShowCamera(true)}
            style={{
              flex: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              height: 40, borderRadius: 8,
              background: '#D88CA6', color: '#fff',
              border: 'none',
              fontSize: 13, fontWeight: 500, cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#D4537E' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#D88CA6' }}
          >
            <Camera size={14} />
            카메라 촬영
          </button>
        </div>
      </div>

      {/* 오프스크린 캡처용 카드 */}
      <div style={{ position: 'fixed', top: -9999, left: -9999, pointerEvents: 'none', zIndex: -1 }}>
        <ShareCard ref={captureRef} date={today} gymGroups={gymGroups} todayVisits={todayVisits} userName={userName} />
      </div>

      {showCamera && (
        <CameraOverlay gymGroups={gymGroups} todayVisits={todayVisits} userName={userName} onClose={() => setShowCamera(false)} />
      )}
    </>
  )
}
