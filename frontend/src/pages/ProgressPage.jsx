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

  const { months } = PERIOD_OPTIONS[periodIdx]

  const filtered = useMemo(() => {
    let list = climbs
    if (filterGymId !== 'all') list = list.filter((c) => c.gymId === filterGymId)
    if (months !== null) {
      const cutoff = new Date()
      cutoff.setMonth(cutoff.getMonth() - months)
      const cutoffStr = cutoff.toISOString().slice(0, 10)
      list = list.filter((c) => c.date >= cutoffStr)
    }
    return list
  }, [climbs, filterGymId, months])

  // 날짜별 완등 개수 (바 차트용)
  const chartData = useMemo(() => {
    const dateMap = {}
    filtered.forEach((c) => {
      if (!dateMap[c.date]) dateMap[c.date] = 0
      dateMap[c.date] += (c.count ?? 1)
    })
    return Object.entries(dateMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ week: date.slice(5), count }))
  }, [filtered])

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
  const thisMonthCount = climbs
    .filter((c) => c.date.startsWith(thisMonth))
    .reduce((sum, c) => sum + (c.count ?? 1), 0)

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
              backgroundColor: periodIdx === i ? '#D88CA6' : '#fff',
              color: periodIdx === i ? '#fff' : '#888780',
              borderColor: periodIdx === i ? '#D88CA6' : '#EDD0DC',
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* 암장 필터 */}
      {gyms.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-5">
          <button
            onClick={() => setFilterGymId('all')}
            className="px-3 py-1 rounded-full text-xs font-medium border transition-colors"
            style={{
              backgroundColor: filterGymId === 'all' ? '#444441' : '#fff',
              color: filterGymId === 'all' ? '#fff' : '#888780',
              borderColor: filterGymId === 'all' ? '#444441' : '#EDD0DC',
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
                borderColor: filterGymId === g.id ? '#444441' : '#EDD0DC',
              }}
            >
              {g.name}
            </button>
          ))}
        </div>
      )}

      {/* 요약 카드 */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {[
          { label: '이번달 완등', value: thisMonthCount, unit: '개' },
          { label: '총 완등', value: totalCount, unit: '개' },
        ].map(({ label, value, unit }) => (
          <div key={label} className="card text-center py-4 px-2">
            <p className="text-xs mb-1" style={{ color: '#888780' }}>{label}</p>
            <p className="font-bold text-xl" style={{ color: '#B5607E' }}>
              {value}<span className="text-sm font-medium ml-0.5" style={{ color: '#888780' }}>{unit}</span>
            </p>
          </div>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-center py-12" style={{ color: '#888780' }}>불러오는 중…</p>
      ) : (
        <div className="space-y-3">
          {/* 브랜드별 최고 색상 */}
          {bestByBrand.length > 0 && (
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
                          ? '1.5px solid #EDD0DC'
                          : '1.5px solid transparent',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.10)',
                      }}
                    />
                    <div>
                      <p className="text-xs" style={{ color: '#888780' }}>{b.brandName}</p>
                      <p className="text-sm font-semibold" style={{ color: '#B5607E' }}>{b.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 날짜별 완등 개수 */}
          {chartData.length >= 2 ? (
            <div className="card">
              <p className="text-sm font-medium mb-4" style={{ color: '#888780' }}>날짜별 완등 개수</p>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EDD0DC" vertical={false} />
                  <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#888780' }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#888780' }} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null
                      return (
                        <div className="card py-2 px-3 text-sm" style={{ minWidth: 90 }}>
                          <p className="text-xs mb-1" style={{ color: '#888780' }}>{label}</p>
                          <p className="font-semibold" style={{ color: '#D88CA6' }}>{payload[0].value}개</p>
                        </div>
                      )
                    }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={32}>
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={i === chartData.length - 1 ? '#D88CA6' : '#F4C0D1'} />
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
