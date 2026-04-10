import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useClimbs } from '../hooks/useClimbs'
import { useVisits } from '../hooks/useVisits'
import { useGoals } from '../hooks/useGoals'
import PageShell from '../components/layout/PageShell'
import DailyShareButton from '../components/share/DailyShareButton'

// 암장 브랜드명 추출 (첫 단어)
function getBrand(gymName) {
  return gymName?.split(' ')[0] ?? gymName
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { climbs } = useClimbs(user?.uid)
  const { visits } = useVisits(user?.uid)
  const { goals } = useGoals(user?.uid)
  const navigate = useNavigate()

  const thisMonth = new Date().toISOString().slice(0, 7)
  const today = new Date().toISOString().slice(0, 10)

  const thisMonthClimbs = climbs.filter((c) => c.date.startsWith(thisMonth))
  const todayClimbs = climbs.filter((c) => c.date === today)

  // ── 이번달 완등: 암장별 색상 집계 ──
  const climbsByGym = thisMonthClimbs.reduce((acc, c) => {
    const key = c.gymName
    if (!acc[key]) acc[key] = {}
    const lvKey = c.gradeLevel
    if (!acc[key][lvKey]) {
      acc[key][lvKey] = { level: c.gradeLevel, label: c.grade, hex: c.gradeColor, count: 0 }
    }
    acc[key][lvKey].count++
    return acc
  }, {})

  // ── 이번달 방문: 브랜드별 집계 ──
  const visitsByBrand = visits
    .filter((v) => v.date.startsWith(thisMonth))
    .reduce((acc, v) => {
      const brand = getBrand(v.gymName)
      acc[brand] = (acc[brand] ?? 0) + 1
      return acc
    }, {})

  // ── 최고레벨: 브랜드별 집계 ──
  const bestByBrand = climbs.reduce((acc, c) => {
    const brand = getBrand(c.gymName)
    if (!acc[brand] || c.gradeLevel > acc[brand]) acc[brand] = c.gradeLevel
    return acc
  }, {})

  // ── 목표 ──
  const activeGoal = goals[0] ?? null
  const currentBestOverall = climbs.reduce((best, c) => Math.max(best, c.gradeLevel ?? 0), 0)
  const goalProgress = activeGoal
    ? Math.min(100, Math.round((currentBestOverall / (activeGoal.targetLevel ?? 1)) * 100))
    : 0

  const firstName = user?.displayName?.split(' ')[0] ?? '유리'

  const gymNames = Object.keys(climbsByGym)
  const brandNames = Object.keys(visitsByBrand)
  const bestBrandNames = Object.keys(bestByBrand)

  return (
    <PageShell>
      {/* 헤더 */}
      <div className="mb-6 pt-2">
        <p className="text-sm text-gray-400 mb-1">안녕하세요,</p>
        <h1 className="font-bold text-3xl" style={{ color: '#1A1A1A' }}>
          {firstName}님의 벽 🧗
        </h1>
      </div>

      {/* 목표 달성률 */}
      {activeGoal && (
        <div className="card mb-5" onClick={() => navigate('/goal')} style={{ cursor: 'pointer' }}>
          <div className="flex justify-between items-center mb-2">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">현재 목표</p>
              <p className="font-bold text-base">
                {currentBestOverall ? `Lv.${currentBestOverall}` : '-'} →{' '}
                <span style={{ color: '#E8366F' }}>Lv.{activeGoal.targetLevel}</span>
              </p>
            </div>
            <span className="font-bold text-lg" style={{ color: '#E8366F' }}>{goalProgress}%</span>
          </div>
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${goalProgress}%` }} />
          </div>
        </div>
      )}

      {/* 이번달 완등 — 암장별 색상 */}
      <div className="mb-5">
        <p className="font-bold text-base mb-3">이번달 완등</p>
        {gymNames.length === 0 ? (
          <div className="card text-center py-6">
            <p className="text-gray-400 text-sm">이번달 완등 기록이 없어요</p>
          </div>
        ) : (
          <div className="space-y-3">
            {gymNames.map((gymName) => {
              const colorMap = climbsByGym[gymName]
              const colors = Object.values(colorMap).sort((a, b) => a.level - b.level)
              const total = colors.reduce((s, c) => s + c.count, 0)
              return (
                <div key={gymName} className="card">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-bold text-sm text-gray-800">{gymName}</span>
                    <span className="text-xs font-semibold" style={{ color: '#E8366F' }}>총 {total}개</span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {colors.map((c) => (
                      <div key={c.level} className="flex flex-col items-center gap-1">
                        <div
                          className="rounded-full flex items-center justify-center font-bold"
                          style={{
                            width: 40, height: 40,
                            backgroundColor: c.hex,
                            border: '2px solid #F0E0E5',
                            fontSize: 14,
                            color: isLight(c.hex) ? '#1A1A1A' : '#fff',
                          }}
                        >
                          {c.count}
                        </div>
                        <span style={{ fontSize: 10, color: '#999' }}>{c.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 이번달 방문 — 브랜드별 */}
      <div className="mb-5">
        <p className="font-bold text-base mb-3">이번달 방문</p>
        {brandNames.length === 0 ? (
          <div className="card text-center py-6">
            <p className="text-gray-400 text-sm">이번달 방문 기록이 없어요</p>
          </div>
        ) : (
          <div className="card">
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              {brandNames.map((brand) => (
                <div key={brand} className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">{brand}</span>
                  <span className="font-bold" style={{ color: '#E8366F' }}>{visitsByBrand[brand]}회</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 최고 레벨 — 브랜드별 */}
      <div className="mb-5">
        <p className="font-bold text-base mb-3">최고 레벨</p>
        {bestBrandNames.length === 0 ? (
          <div className="card text-center py-6">
            <p className="text-gray-400 text-sm">기록이 없어요</p>
          </div>
        ) : (
          <div className="card">
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              {bestBrandNames.map((brand) => (
                <div key={brand} className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">{brand}</span>
                  <span className="font-bold" style={{ color: '#E8366F' }}>Lv.{bestByBrand[brand]}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 버튼 */}
      <div className="space-y-3">
        <button onClick={() => navigate('/routes')} className="btn-primary w-full">
          + 기록하기
        </button>
        <DailyShareButton todayClimbs={todayClimbs} />
      </div>
    </PageShell>
  )
}

function isLight(hex) {
  if (!hex || hex.length < 7) return true
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return r * 0.299 + g * 0.587 + b * 0.114 > 180
}
