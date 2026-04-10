import { useState, useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { useAuth } from '../context/AuthContext'
import { useClimbs } from '../hooks/useClimbs'
import { useGyms } from '../hooks/useGyms'
import PageShell from '../components/layout/PageShell'


function getWeekKey(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  // 월요일 기준 주 시작
  const day = d.getDay() || 7
  d.setDate(d.getDate() - day + 1)
  return d.toISOString().slice(0, 10)
}

const PERIOD_OPTIONS = [
  { label: '1개월', months: 1 },
  { label: '3개월', months: 3 },
  { label: '전체', months: null },
]

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="card py-2 px-3 text-sm" style={{ minWidth: 100 }}>
      <p className="text-gray-400 text-xs mb-1">{label}</p>
      <p className="font-bold" style={{ color: '#E8366F' }}>Lv.{payload[0].value}</p>
    </div>
  )
}

export default function ProgressPage() {
  const { user } = useAuth()
  const { climbs, loading } = useClimbs(user?.uid)
  const { gyms } = useGyms(user?.uid)
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

  // 날짜별 최고 레벨
  const chartData = useMemo(() => {
    const dateMap = {}
    filtered.forEach((c) => {
      const lv = c.gradeLevel ?? 0
      if (!lv) return
      if (!dateMap[c.date] || lv > dateMap[c.date]) dateMap[c.date] = lv
    })
    return Object.entries(dateMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, maxV]) => ({ week: date.slice(5), maxV }))
  }, [filtered])

  // 요약 통계
  const totalCount = filtered.reduce((sum, c) => sum + (c.count ?? 1), 0)
  const bestNum = filtered.reduce((best, c) => {
    const lv = c.gradeLevel ?? 0
    return lv > best ? lv : best
  }, 0)
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
            className="px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors"
            style={{
              backgroundColor: periodIdx === i ? '#E8366F' : '#fff',
              color: periodIdx === i ? '#fff' : '#666',
              borderColor: periodIdx === i ? '#E8366F' : '#F0E0E5',
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
              backgroundColor: filterGymId === 'all' ? '#1A1A1A' : '#fff',
              color: filterGymId === 'all' ? '#fff' : '#666',
              borderColor: filterGymId === 'all' ? '#1A1A1A' : '#F0E0E5',
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
                backgroundColor: filterGymId === g.id ? '#1A1A1A' : '#fff',
                color: filterGymId === g.id ? '#fff' : '#666',
                borderColor: filterGymId === g.id ? '#1A1A1A' : '#F0E0E5',
              }}
            >
              {g.name}
            </button>
          ))}
        </div>
      )}

      {/* 요약 카드 */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: '이번달 완등', value: thisMonthCount, unit: '개' },
          { label: '최고 레벨', value: bestNum > 0 ? `Lv.${bestNum}` : '-', unit: '' },
          { label: '총 완등', value: totalCount, unit: '개' },
        ].map(({ label, value, unit }) => (
          <div key={label} className="card text-center py-4 px-2">
            <p className="text-xs text-gray-400 mb-1">{label}</p>
            <p className="font-bold text-xl" style={{ color: '#E8366F' }}>
              {value}<span className="text-sm font-medium text-gray-400 ml-0.5">{unit}</span>
            </p>
          </div>
        ))}
      </div>

      {/* 차트 */}
      {loading ? (
        <p className="text-gray-400 text-sm text-center py-12">불러오는 중…</p>
      ) : chartData.length < 2 ? (
        <div className="card text-center py-12">
          <div className="text-4xl mb-3">📈</div>
          <p className="text-gray-500 font-medium">데이터가 부족해요</p>
          <p className="text-gray-400 text-sm mt-1">이틀 이상 기록하면 그래프가 나타나요</p>
        </div>
      ) : (
        <div className="card">
          <p className="text-sm font-semibold text-gray-600 mb-4">날짜별 최고 레벨</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EBEBEB" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#999' }} />
              <YAxis
                domain={[1, 11]}
                tickFormatter={(n) => `Lv.${n}`}
                tick={{ fontSize: 11, fill: '#999' }}
                ticks={[1, 3, 5, 7, 9, 11]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="maxV"
                stroke="#E8366F"
                strokeWidth={2.5}
                dot={{ fill: '#E8366F', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </PageShell>
  )
}
