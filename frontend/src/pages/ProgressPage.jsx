import { useState, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { useAuth } from '../context/AuthContext'
import { useClimbs } from '../hooks/useClimbs'
import { useGyms } from '../hooks/useGyms'
import { useGymBrands, getBrandName } from '../hooks/useGymBrands'
import PageShell from '../components/layout/PageShell'

const PERIOD_OPTIONS = [
  { label: '1개월', months: 1 },
  { label: '3개월', months: 3 },
  { label: '전체', months: null },
]

export default function ProgressPage() {
  const { user } = useAuth()
  const { climbs, loading } = useClimbs(user?.uid)
  const { gyms } = useGyms(user?.uid)
  const { brands } = useGymBrands()
  const [periodIdx, setPeriodIdx] = useState(1)
  const [filterGymId, setFilterGymId] = useState('all')
  const [rangeStart, setRangeStart] = useState('')
  const [rangeEnd, setRangeEnd] = useState('')

  const { months } = PERIOD_OPTIONS[periodIdx]

  const filtered = useMemo(() => {
    let list = climbs
    if (filterGymId !== 'all') list = list.filter((c) => c.gymId === filterGymId)
    if (months !== null) {
      const cutoff = new Date()
      cutoff.setMonth(cutoff.getMonth() - months)
      const cutoffStr = cutoff.toISOString().slice(0, 10)
      list = list.filter((c) => c.date >= cutoffStr)
    } else {
      if (rangeStart) list = list.filter((c) => c.date.slice(0, 7) >= rangeStart)
      if (rangeEnd) list = list.filter((c) => c.date.slice(0, 7) <= rangeEnd)
    }
    return list
  }, [climbs, filterGymId, months, rangeStart, rangeEnd])

  const chartData = useMemo(() => {
    const map = {}
    if (months === 1) {
      filtered.forEach((c) => { map[c.date] = (map[c.date] ?? 0) + (c.count ?? 1) })
      return Object.entries(map).sort(([a], [b]) => a.localeCompare(b)).map(([d, count]) => ({ label: d.slice(5), count }))
    }
    if (months === 3) {
      filtered.forEach((c) => {
        const d = new Date(c.date + 'T00:00:00')
        const day = d.getDay()
        d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day))
        const key = d.toISOString().slice(0, 10)
        map[key] = (map[key] ?? 0) + (c.count ?? 1)
      })
      return Object.entries(map).sort(([a], [b]) => a.localeCompare(b)).map(([d, count]) => ({ label: d.slice(5), count }))
    }
    // 전체: 월별
    filtered.forEach((c) => {
      const key = c.date.slice(0, 7)
      map[key] = (map[key] ?? 0) + (c.count ?? 1)
    })
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b)).map(([m, count]) => ({ label: m.slice(2).replace('-', '/'), count }))
  }, [filtered, months])

  // 브랜드별 최고 색상
  const bestByBrand = useMemo(() => {
    const acc = {}
    filtered.forEach((c) => {
      const key = getBrandName(c.gymName, brands)
      if (!acc[key] || (c.gradeLevel ?? 0) > acc[key].level) {
        acc[key] = { brandName: key, level: c.gradeLevel, hex: c.gradeColor, label: c.grade }
      }
    })
    return Object.values(acc).filter((b) => b.level > 0)
  }, [filtered, brands])

  const totalCount = filtered.reduce((sum, c) => sum + (c.count ?? 1), 0)
  const thisMonth = new Date().toISOString().slice(0, 7)
  const lastMonthDate = new Date(); lastMonthDate.setMonth(lastMonthDate.getMonth() - 1)
  const lastMonth = lastMonthDate.toISOString().slice(0, 7)

  const gymFiltered = (list) => filterGymId === 'all' ? list : list.filter((c) => c.gymId === filterGymId)

  const thisMonthCount = gymFiltered(climbs)
    .filter((c) => c.date.startsWith(thisMonth))
    .reduce((sum, c) => sum + (c.count ?? 1), 0)

  const lastMonthCount = months === 1
    ? gymFiltered(climbs)
        .filter((c) => c.date.startsWith(lastMonth))
        .reduce((sum, c) => sum + (c.count ?? 1), 0)
    : 0

  const monthComparisons = useMemo(() => {
    if (months !== 1) return null
    const base = gymFiltered(climbs)
    const toBestMap = (list) => {
      const acc = {}
      list.forEach((c) => {
        const key = getBrandName(c.gymName, brands)
        if (!acc[key] || (c.gradeLevel ?? 0) > (acc[key].level ?? 0))
          acc[key] = { level: c.gradeLevel ?? 0, hex: c.gradeColor, label: c.grade }
      })
      return acc
    }
    const thisMap = toBestMap(base.filter((c) => c.date.startsWith(thisMonth)))
    const lastMap = toBestMap(base.filter((c) => c.date.startsWith(lastMonth)))
    const allKeys = new Set([...Object.keys(thisMap), ...Object.keys(lastMap)])
    return Array.from(allKeys)
      .map((brandName) => ({ brandName, current: thisMap[brandName] ?? null, prev: lastMap[brandName] ?? null }))
      .filter((b) => (b.current?.level ?? 0) > 0 || (b.prev?.level ?? 0) > 0)
  }, [climbs, brands, filterGymId, months, thisMonth, lastMonth]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <PageShell title="성장 차트">
      {/* 기간 필터 */}
      <div className="flex gap-2 mb-4">
        {PERIOD_OPTIONS.map((opt, i) => (
          <button
            key={opt.label}
            onClick={() => setPeriodIdx(i)}
            className="px-4 py-1.5 rounded-full text-sm font-medium border transition-colors"
            style={{
              backgroundColor: periodIdx === i ? 'var(--color-primary)' : '#fff',
              color: periodIdx === i ? '#fff' : '#888780',
              borderColor: periodIdx === i ? 'var(--color-primary)' : 'var(--color-primary-border)',
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* 전체 기간 범위 선택 */}
      {months === null && (
        <div className="flex gap-3 mb-4">
          <div className="flex-1">
            <p className="text-xs mb-1" style={{ color: '#888780' }}>시작</p>
            <input
              type="month"
              value={rangeStart}
              onChange={(e) => setRangeStart(e.target.value)}
              className="input-field w-full"
              style={{ height: 36, fontSize: 13 }}
            />
          </div>
          <div className="flex-1">
            <p className="text-xs mb-1" style={{ color: '#888780' }}>끝</p>
            <input
              type="month"
              value={rangeEnd}
              onChange={(e) => setRangeEnd(e.target.value)}
              className="input-field w-full"
              style={{ height: 36, fontSize: 13 }}
            />
          </div>
        </div>
      )}

      {/* 암장 필터 */}
      {gyms.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-5">
          <button
            onClick={() => setFilterGymId('all')}
            className="px-3 py-1 rounded-full text-xs font-medium border transition-colors"
            style={{
              backgroundColor: filterGymId === 'all' ? '#444441' : '#fff',
              color: filterGymId === 'all' ? '#fff' : '#888780',
              borderColor: filterGymId === 'all' ? '#444441' : 'var(--color-primary-border)',
            }}
          >
            전체
          </button>
          {gyms.map((g) => (
            <button
              key={g.id}
              onClick={() => setFilterGymId(filterGymId === g.id ? 'all' : g.id)}
              className="px-3 py-1 rounded-full text-xs font-medium border transition-colors"
              style={{
                backgroundColor: filterGymId === g.id ? '#444441' : '#fff',
                color: filterGymId === g.id ? '#fff' : '#888780',
                borderColor: filterGymId === g.id ? '#444441' : 'var(--color-primary-border)',
              }}
            >
              {g.name}
            </button>
          ))}
        </div>
      )}

      {/* 요약 카드 */}
      {months === 1 ? (
        <div className="grid grid-cols-2 gap-3 mb-5">
          {[{ label: '이번달 완등', value: thisMonthCount }, { label: '저번달 완등', value: lastMonthCount }].map(({ label, value }) => (
            <div key={label} className="card text-center py-4 px-2">
              <p className="text-xs mb-1" style={{ color: '#888780' }}>{label}</p>
              <p className="font-bold text-xl" style={{ color: 'var(--color-primary-dark)' }}>
                {value}<span className="text-sm font-medium ml-0.5" style={{ color: '#888780' }}>개</span>
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-4 px-2 mb-5">
          <p className="text-xs mb-1" style={{ color: '#888780' }}>총 완등</p>
          <p className="font-bold text-xl" style={{ color: 'var(--color-primary-dark)' }}>
            {totalCount}<span className="text-sm font-medium ml-0.5" style={{ color: '#888780' }}>개</span>
          </p>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-center py-12" style={{ color: '#888780' }}>불러오는 중…</p>
      ) : (
        <div className="space-y-3">
          {/* 브랜드별 최고 색상 */}
          {months === 1 ? (
            monthComparisons?.length > 0 && (
              <div className="card">
                <p className="text-sm font-medium mb-4" style={{ color: '#888780' }}>브랜드별 최고 색상</p>
                <div className="flex flex-wrap gap-5">
                  {monthComparisons.map((b) => {
                    const dot = (hex) => ({
                      width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                      backgroundColor: hex ?? '#F3F3F1',
                      border: (!hex || hex === '#FFFFFF' || hex === '#E5E7EB') ? '1.5px solid var(--color-primary-border)' : '1.5px solid transparent',
                      boxShadow: hex ? '0 1px 4px rgba(0,0,0,0.10)' : 'none',
                    })
                    return (
                      <div key={b.brandName}>
                        <p className="text-xs mb-2" style={{ color: '#888780' }}>{b.brandName}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col items-center gap-1">
                            <div style={dot(b.prev?.hex ?? null)} />
                            <p className="text-xs font-medium" style={{ color: b.prev ? 'var(--color-primary-dark)' : '#C9C7BD' }}>{b.prev?.label ?? '-'}</p>
                            <p className="text-xs" style={{ color: '#C9C7BD' }}>저번달</p>
                          </div>
                          <span className="text-sm pb-5" style={{ color: 'var(--color-primary-border)' }}>→</span>
                          <div className="flex flex-col items-center gap-1">
                            <div style={dot(b.current?.hex ?? null)} />
                            <p className="text-xs font-medium" style={{ color: b.current ? 'var(--color-primary-dark)' : '#C9C7BD' }}>{b.current?.label ?? '-'}</p>
                            <p className="text-xs" style={{ color: '#C9C7BD' }}>이번달</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          ) : (
            bestByBrand.length > 0 && (
              <div className="card">
                <p className="text-sm font-medium mb-4" style={{ color: '#888780' }}>브랜드별 최고 색상</p>
                <div className="flex flex-wrap gap-4">
                  {bestByBrand.map((b) => (
                    <div key={b.brandName} className="flex items-center gap-2.5">
                      <div
                        className="rounded-full shrink-0"
                        style={{
                          width: 36, height: 36,
                          backgroundColor: b.hex,
                          border: b.hex === '#FFFFFF' || b.hex === '#E5E7EB'
                            ? '1.5px solid var(--color-primary-border)'
                            : '1.5px solid transparent',
                          boxShadow: '0 1px 4px rgba(0,0,0,0.10)',
                        }}
                      />
                      <div>
                        <p className="text-xs" style={{ color: '#888780' }}>{b.brandName}</p>
                        <p className="text-sm font-semibold" style={{ color: 'var(--color-primary-dark)' }}>{b.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}

          {/* 날짜별 완등 개수 */}
          {chartData.length >= 2 ? (
            <div className="card">
              <p className="text-sm font-medium mb-4" style={{ color: '#888780' }}>
                {months === 1 ? '날짜별' : months === 3 ? '주별' : '월별'} 완등 개수
              </p>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-primary-border)" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#888780' }} interval="preserveStartEnd" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#888780' }} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null
                      return (
                        <div className="card py-2 px-3 text-sm" style={{ minWidth: 90 }}>
                          <p className="text-xs mb-1" style={{ color: '#888780' }}>{label}</p>
                          <p className="font-semibold" style={{ color: 'var(--color-primary)' }}>{payload[0].value}개</p>
                        </div>
                      )
                    }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={32}>
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={i === chartData.length - 1 ? 'var(--color-primary)' : 'var(--color-primary-track)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="card text-center py-12">
              <div className="text-4xl mb-3">📈</div>
              <p className="font-medium" style={{ color: '#444441' }}>데이터가 부족해요</p>
              <p className="text-sm mt-1" style={{ color: '#888780' }}>이틀 이상 기록하면 그래프가 나타나요</p>
            </div>
          )}
        </div>
      )}
    </PageShell>
  )
}
