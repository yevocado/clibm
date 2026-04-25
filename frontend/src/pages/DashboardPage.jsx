import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useClimbs } from '../hooks/useClimbs'
import { useGoals } from '../hooks/useGoals'
import PageShell from '../components/layout/PageShell'
import DailyShareButton from '../components/share/DailyShareButton'
import { getGymBrand } from '../constants/gymPresets'

function isLight(hex) {
  if (!hex || hex.length < 7) return true
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return r * 0.299 + g * 0.587 + b * 0.114 > 180
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { climbs } = useClimbs(user?.uid)
  const { goals } = useGoals(user?.uid)
  const navigate = useNavigate()

  const today = new Date().toISOString().slice(0, 10)

  const todayClimbs = climbs.filter((c) => c.date === today)

  // ── 완등: 월 → gymId 기준으로 집계 ──
  const climbsByMonth = climbs.reduce((acc, c) => {
    const month = c.date.slice(0, 7)
    if (!acc[month]) acc[month] = {}
    const key = c.gymId
    if (!acc[month][key]) acc[month][key] = { gymName: c.gymName, colorMap: {} }
    const lvKey = c.gradeLevel
    if (!acc[month][key].colorMap[lvKey]) {
      acc[month][key].colorMap[lvKey] = { level: c.gradeLevel, label: c.grade, hex: c.gradeColor, count: 0 }
    }
    acc[month][key].colorMap[lvKey].count += (c.count ?? 1)
    return acc
  }, {})
  const climbMonthKeys = Object.keys(climbsByMonth).sort((a, b) => b.localeCompare(a))

  const [expandedClimbMonths, setExpandedClimbMonths] = useState(new Set())
  const toggleClimbMonth = (month) => setExpandedClimbMonths((prev) => {
    const next = new Set(prev)
    next.has(month) ? next.delete(month) : next.add(month)
    return next
  })

  // ── 방문: 월 → gymId 기준 유니크 날짜 카운트 ──
  const visitsByMonth = climbs.reduce((acc, c) => {
    const month = c.date.slice(0, 7)
    const dedupKey = `${c.date}_${c.gymId}`
    if (!acc[month]) acc[month] = { seen: new Set(), gyms: {} }
    if (acc[month].seen.has(dedupKey)) return acc
    acc[month].seen.add(dedupKey)
    if (!acc[month].gyms[c.gymId]) acc[month].gyms[c.gymId] = { gymName: c.gymName, count: 0 }
    acc[month].gyms[c.gymId].count += 1
    return acc
  }, {})
  const visitMonthKeys = Object.keys(visitsByMonth).sort((a, b) => b.localeCompare(a))

  const [expandedVisitMonths, setExpandedVisitMonths] = useState(new Set())
  useEffect(() => {
    if (visitMonthKeys.length > 0) {
      setExpandedVisitMonths((prev) => prev.size === 0 ? new Set([visitMonthKeys[0]]) : prev)
    }
  }, [visitMonthKeys[0]])

  const toggleVisitMonth = (month) => setExpandedVisitMonths((prev) => {
    const next = new Set(prev)
    next.has(month) ? next.delete(month) : next.add(month)
    return next
  })

  // ── 최고 레벨: 암장별 집계 ──
  const bestByGymId = climbs.reduce((acc, c) => {
    const key = c.gymId
    if (!acc[key] || (c.gradeLevel ?? 0) > acc[key].level) {
      acc[key] = { gymName: c.gymName, level: c.gradeLevel, hex: c.gradeColor, label: c.grade }
    }
    return acc
  }, {})

  // ── 목표: 기한 안 지난 것만 ──
  const activeGoals = goals.filter((g) => !g.deadline || g.deadline >= today)

  const getGoalProgress = (goal) => {
    const currentCount = goal.targetColor && goal.gymBrand
      ? climbs.reduce((sum, c) => {
          if (getGymBrand(c.gymName) !== goal.gymBrand) return sum
          if (c.grade !== goal.targetColor.label) return sum
          return sum + (c.count ?? 1)
        }, 0)
      : climbs.reduce((best, c) => Math.max(best, c.gradeLevel ?? 0), 0)
    const target = goal.targetColor ? (goal.targetCount ?? 1) : (goal.targetLevel ?? 1)
    return { currentCount, target, progress: Math.min(100, Math.round((currentCount / target) * 100)) }
  }

  // ── 오늘 방문한 암장 (카드/촬영용) ──
  const seenToday = new Map()
  todayClimbs.forEach((c) => seenToday.set(c.gymId, c.gymName))
  const todayVisits = [...seenToday.entries()].map(([id, gymName]) => ({ id, gymName }))

  const firstName = user?.displayName?.split(' ')[0] ?? '유리'

  const bestEntries = Object.entries(bestByGymId)

  return (
    <PageShell>
      {/* 헤더 */}
      <div className="mb-6 pt-2">
        <p className="text-sm mb-1" style={{ color: '#888780' }}>안녕하세요,</p>
        <h1 className="font-bold text-3xl" style={{ color: '#444441', lineHeight: 1.25 }}>
          {firstName}님의 벽 🧗
        </h1>
      </div>

      {/* 목표 달성률 */}
      {activeGoals.length === 0 ? (
        <div
          className="card mb-5"
          onClick={() => navigate('/goal')}
          style={{ cursor: 'pointer', borderStyle: 'dashed' }}
        >
          <div className="flex items-center gap-3">
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: '#FBF0F4',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, flexShrink: 0,
            }}>🎯</div>
            <div>
              <p className="font-semibold text-sm" style={{ color: '#444441' }}>목표 레벨을 설정해보세요</p>
              <p className="text-xs mt-0.5" style={{ color: '#888780' }}>도전할 V등급을 정하고 성장을 추적해요</p>
            </div>
            <span className="ml-auto text-xs font-medium" style={{ color: '#D88CA6', flexShrink: 0 }}>설정 →</span>
          </div>
        </div>
      ) : (
        <div className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-base" style={{ color: '#444441' }}>진행 중인 목표</p>
            <button
              onClick={() => navigate('/goal')}
              className="text-xs font-medium"
              style={{ color: '#D88CA6' }}
            >
              전체 보기 →
            </button>
          </div>
          <div className="space-y-2">
            {activeGoals.map((goal) => {
              const { currentCount, target, progress } = getGoalProgress(goal)
              const achieved = currentCount >= target
              const hex = goal.targetColor?.hex ?? '#D88CA6'
              const daysLeft = goal.deadline
                ? Math.ceil((new Date(goal.deadline + 'T00:00:00') - new Date()) / 86400000)
                : null
              return (
                <div
                  key={goal.id}
                  className="card"
                  onClick={() => navigate('/goal')}
                  style={{ cursor: 'pointer', padding: '12px 14px' }}
                >
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="rounded-full shrink-0" style={{ width: 24, height: 24, backgroundColor: hex, border: '1.5px solid #EDD0DC' }} />
                    <div className="flex-1 min-w-0 flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs" style={{ color: '#888780' }}>{goal.gymBrand ?? '전체'}</span>
                      <span style={{ color: '#D3D1C7', fontSize: 10 }}>·</span>
                      <span className="font-semibold text-sm" style={{ color: achieved ? '#F59E0B' : '#444441' }}>
                        {goal.targetColor?.label ?? `Lv.${goal.targetLevel}`}
                      </span>
                      <span className="text-sm font-semibold" style={{ color: '#D88CA6' }}>{target}개</span>
                    </div>
                    <span className="font-bold text-sm shrink-0" style={{ color: '#B5607E' }}>{progress}%</span>
                  </div>
                  <div className="progress-bar-track mb-2">
                    <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs" style={{ color: '#888780' }}>{currentCount} / {target}개</span>
                    {goal.deadline && (
                      <span className="text-xs" style={{ color: '#888780' }}>
                        {daysLeft !== null && daysLeft >= 0 ? `D-${daysLeft} · ${goal.deadline}` : `기한 지남`}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 완등 기록 — 월별 접기 */}
      <div className="mb-5">
        <p className="font-semibold text-base mb-3" style={{ color: '#444441' }}>완등 기록</p>
        {climbMonthKeys.length === 0 ? (
          <div className="card text-center py-6">
            <p className="text-sm" style={{ color: '#888780' }}>완등 기록이 없어요</p>
          </div>
        ) : (
          <div className="space-y-2">
            {climbMonthKeys.map((month) => {
              const gymMap = climbsByMonth[month]
              const gymList = Object.entries(gymMap)
              const monthTotal = gymList.flatMap(([, { colorMap }]) => Object.values(colorMap)).reduce((s, c) => s + c.count, 0)
              const isOpen = expandedClimbMonths.has(month)
              const [y, m] = month.split('-')
              const label = `${y}년 ${parseInt(m)}월`
              return (
                <div key={month}>
                  <button
                    onClick={() => toggleClimbMonth(month)}
                    className="flex items-center gap-3 w-full py-1"
                  >
                    <span className="font-semibold text-sm" style={{ color: '#D88CA6' }}>{label}</span>
                    <span className="text-xs font-medium" style={{ color: '#888780' }}>{monthTotal}개</span>
                    <div className="flex-1 h-px" style={{ background: '#EDD0DC' }} />
                    <ChevronDown
                      size={14}
                      style={{
                        color: '#D3D1C7',
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s',
                        flexShrink: 0,
                      }}
                    />
                  </button>
                  {isOpen && (
                    <div className="space-y-1.5 mt-1.5">
                      {gymList.map(([gymId, { gymName, colorMap }]) => {
                        const colors = Object.values(colorMap).sort((a, b) => a.level - b.level)
                        const total = colors.reduce((s, c) => s + c.count, 0)
                        return (
                          <div key={gymId} className="card flex items-center gap-3" style={{ padding: '10px 14px' }}>
                            <span className="font-semibold text-sm shrink-0" style={{ color: '#444441' }}>{gymName}</span>
                            <div className="flex flex-wrap gap-2 flex-1">
                              {colors.map((c) => (
                                <div key={c.level} className="flex items-center gap-1">
                                  <div style={{
                                    width: 10, height: 10, borderRadius: '50%',
                                    backgroundColor: c.hex, border: '0.5px solid #EDD0DC', flexShrink: 0,
                                  }} />
                                  <span style={{ fontSize: 11, color: '#888780' }}>{c.count}</span>
                                </div>
                              ))}
                            </div>
                            <span className="text-xs font-medium shrink-0" style={{ color: '#B5607E' }}>총 {total}개</span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 방문 기록 — 월별 접기 */}
      <div className="mb-5">
        <p className="font-semibold text-base mb-3" style={{ color: '#444441' }}>방문 기록</p>
        {visitMonthKeys.length === 0 ? (
          <div className="card text-center py-6">
            <p className="text-sm" style={{ color: '#888780' }}>방문 기록이 없어요</p>
          </div>
        ) : (
          <div className="space-y-2">
            {visitMonthKeys.map((month) => {
              const { gyms } = visitsByMonth[month]
              const gymList = Object.entries(gyms)
              const monthTotal = gymList.reduce((s, [, g]) => s + g.count, 0)
              const isOpen = expandedVisitMonths.has(month)
              const [y, m] = month.split('-')
              const label = `${y}년 ${parseInt(m)}월`
              return (
                <div key={month}>
                  <button
                    onClick={() => toggleVisitMonth(month)}
                    className="flex items-center gap-3 w-full py-1"
                  >
                    <span className="font-semibold text-sm" style={{ color: '#D88CA6' }}>{label}</span>
                    <span className="text-xs font-medium" style={{ color: '#888780' }}>{monthTotal}회</span>
                    <div className="flex-1 h-px" style={{ background: '#EDD0DC' }} />
                    <ChevronDown
                      size={14}
                      style={{
                        color: '#D3D1C7',
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s',
                        flexShrink: 0,
                      }}
                    />
                  </button>
                  {isOpen && (
                    <div className="card mt-1.5">
                      <div className="flex flex-wrap gap-x-6 gap-y-2">
                        {gymList.map(([gymId, { gymName, count }]) => (
                          <div key={gymId} className="flex items-center gap-2">
                            <span className="text-sm font-medium" style={{ color: '#444441' }}>{gymName}</span>
                            <span className="font-semibold" style={{ color: '#D88CA6' }}>{count}회</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 최고 레벨 — 암장별 */}
      <div className="mb-5">
        <p className="font-semibold text-base mb-3" style={{ color: '#444441' }}>최고 레벨</p>
        {bestEntries.length === 0 ? (
          <div className="card text-center py-6">
            <p className="text-sm" style={{ color: '#888780' }}>기록이 없어요</p>
          </div>
        ) : (
          <div className="card">
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              {bestEntries.map(([gymId, best]) => (
                <div key={gymId} className="flex items-center gap-2.5">
                  <div
                    className="rounded-full shrink-0 flex items-center justify-center font-bold"
                    style={{
                      width: 32, height: 32,
                      backgroundColor: best.hex,
                      border: '1px solid #EDD0DC',
                      fontSize: 11,
                      color: isLight(best.hex) ? '#444441' : '#fff',
                    }}
                  >
                    {best.level}
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: '#888780' }}>{best.gymName}</p>
                    <p className="text-xs font-medium" style={{ color: '#B5607E' }}>{best.label} · Lv.{best.level}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 기록하기 버튼 */}
      <button onClick={() => navigate('/routes')} className="btn-primary w-full mb-5">
        + 기록하기
      </button>

      {/* 오늘의 기록 카드 (촬영/저장 포함) */}
      <DailyShareButton todayClimbs={todayClimbs} todayVisits={todayVisits} userName={firstName} />
    </PageShell>
  )
}
