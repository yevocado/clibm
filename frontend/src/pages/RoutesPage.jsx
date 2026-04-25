import { useState } from 'react'
import { Trash2, ChevronLeft, ChevronRight, Minus, Plus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useClimbs } from '../hooks/useClimbs'
import { useGyms } from '../hooks/useGyms'
import ClimbForm from '../components/climbs/ClimbForm'
import PageShell from '../components/layout/PageShell'

function isLight(hex) {
  if (!hex || hex.length < 7) return true
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return r * 0.299 + g * 0.587 + b * 0.114 > 180
}

const DOW = ['일', '월', '화', '수', '목', '금', '토']

function MonthCalendar({ climbs, month, onMonthChange }) {
  const [y, m] = month.split('-').map(Number)
  const firstDow = new Date(y, m - 1, 1).getDay()
  const totalDays = new Date(y, m, 0).getDate()

  const dayMap = {}
  climbs.forEach((c) => {
    if (!c.date.startsWith(month)) return
    if (!dayMap[c.date]) dayMap[c.date] = {}
    const hex = c.gradeColor
    dayMap[c.date][hex] = (dayMap[c.date][hex] ?? 0) + (c.count ?? 1)
  })

  const cells = [...Array(firstDow).fill(null), ...Array.from({ length: totalDays }, (_, i) => i + 1)]

  const formatMonth = (k) => {
    const [yy, mm] = k.split('-')
    return `${yy}년 ${parseInt(mm)}월`
  }

  return (
    <div className="card mb-5">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => onMonthChange(-1)}
          className="p-1 rounded-full transition-colors"
          style={{ color: '#888780' }}
        >
          <ChevronLeft size={16} />
        </button>
        <span className="font-semibold text-sm" style={{ color: '#444441' }}>{formatMonth(month)}</span>
        <button
          onClick={() => onMonthChange(1)}
          className="p-1 rounded-full transition-colors"
          style={{ color: '#888780' }}
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-y-1 text-center">
        {DOW.map((d) => (
          <div key={d} style={{ fontSize: 10, color: '#D3D1C7', paddingBottom: 4 }}>{d}</div>
        ))}
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />
          const dateKey = `${month}-${String(day).padStart(2, '0')}`
          const colorEntries = Object.entries(dayMap[dateKey] ?? {})
          return (
            <div key={day} className="flex flex-col items-center" style={{ minHeight: 40 }}>
              <span style={{
                fontSize: 11,
                color: colorEntries.length > 0 ? '#444441' : '#C9C7BE',
                fontWeight: colorEntries.length > 0 ? 600 : 400,
              }}>{day}</span>
              {colorEntries.length > 0 && (
                <div className="flex flex-wrap justify-center gap-px mt-0.5" style={{ maxWidth: 28 }}>
                  {colorEntries.slice(0, 4).map(([hex]) => (
                    <div
                      key={hex}
                      style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: hex, border: '0.5px solid #EDD0DC' }}
                    />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function DayCard({ date, climbs, onDelete, onUpdate }) {
  const [editingId, setEditingId] = useState(null)

  const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString('ko-KR', {
    month: 'long', day: 'numeric', weekday: 'short',
  })

  const byGym = climbs.reduce((acc, c) => {
    if (!acc[c.gymId]) acc[c.gymId] = { gymName: c.gymName, entries: [] }
    acc[c.gymId].entries.push(c)
    return acc
  }, {})

  const gymGroups = Object.values(byGym)
  const totalCount = climbs.reduce((s, c) => s + (c.count ?? 1), 0)

  const handleCountChange = (entry, delta) => {
    const next = Math.max(1, (entry.count ?? 1) + delta)
    onUpdate(entry.id, { count: next })
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <span className="font-semibold text-sm" style={{ color: '#444441' }}>{formattedDate}</span>
        <span className="text-xs font-medium" style={{ color: '#B5607E' }}>총 {totalCount}개</span>
      </div>

      <div className="space-y-4">
        {gymGroups.map((gym, gi) => (
          <div key={gym.gymName}>
            <p className="text-xs mb-2" style={{ color: '#888780', fontWeight: gymGroups.length > 1 ? 500 : 400 }}>
              {gym.gymName}
            </p>
            <div className="flex flex-wrap gap-3">
              {gym.entries.map((entry) => {
                const isEditing = editingId === entry.id
                return (
                  <div key={entry.id} className="flex flex-col items-center gap-1">
                    {isEditing ? (
                      <div
                        className="flex flex-col items-center gap-1.5 rounded-2xl py-2 px-2"
                        style={{ background: '#FBF0F4', border: '1px solid #EDD0DC', minWidth: 80 }}
                      >
                        {/* 카운터 */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleCountChange(entry, -1)}
                            style={{ width: 22, height: 22, borderRadius: '50%', background: '#EDD0DC', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                          >
                            <Minus size={10} color="#B5607E" />
                          </button>
                          <span className="font-bold text-sm w-5 text-center" style={{ color: '#444441' }}>{entry.count ?? 1}</span>
                          <button
                            onClick={() => handleCountChange(entry, 1)}
                            style={{ width: 22, height: 22, borderRadius: '50%', background: '#EDD0DC', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                          >
                            <Plus size={10} color="#B5607E" />
                          </button>
                        </div>
                        {/* 닫기 / 삭제 */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingId(null)}
                            className="text-xs font-medium px-2 py-0.5 rounded-full"
                            style={{ background: '#fff', color: '#888780', border: '1px solid #EDD0DC' }}
                          >
                            완료
                          </button>
                          <button
                            onClick={() => { if (confirm('삭제할까요?')) { onDelete(entry.id); setEditingId(null) } }}
                            className="text-xs font-medium px-2 py-0.5 rounded-full"
                            style={{ background: '#fff', color: '#B5607E', border: '1px solid #EDD0DC' }}
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditingId(entry.id)}
                        className="rounded-full flex items-center justify-center font-bold"
                        style={{
                          width: 44, height: 44,
                          backgroundColor: entry.gradeColor,
                          border: '1px solid #EDD0DC',
                          fontSize: 15,
                          color: isLight(entry.gradeColor) ? '#444441' : '#fff',
                          cursor: 'pointer',
                        }}
                      >
                        {entry.count ?? 1}
                      </button>
                    )}
                    <span style={{ fontSize: 10, color: '#888780' }}>{entry.grade}</span>
                  </div>
                )
              })}
            </div>
            {gym.entries.some(e => e.memo) && (
              <div className="mt-2 space-y-1">
                {gym.entries.filter(e => e.memo).map(e => (
                  <p key={e.id} className="text-xs leading-snug" style={{ color: '#888780' }}>
                    {e.grade} — {e.memo}
                  </p>
                ))}
              </div>
            )}
            {gi < gymGroups.length - 1 && (
              <div style={{ height: '0.5px', background: '#EDD0DC', marginTop: 12 }} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function offsetMonth(base, delta) {
  const [y, m] = base.split('-').map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export default function RoutesPage() {
  const { user } = useAuth()
  const { climbs, loading, addClimb, deleteClimb, updateClimb } = useClimbs(user?.uid)
  const { gyms } = useGyms(user?.uid)
  const [showForm, setShowForm] = useState(false)
  const [filterGymId, setFilterGymId] = useState('all')
  const [calMonth, setCalMonth] = useState(new Date().toISOString().slice(0, 7))

  const handleAdd = async (entries) => {
    for (const data of entries) {
      await addClimb(data)
    }
    setShowForm(false)
  }

  if (showForm) {
    return (
      <PageShell title="기록 추가">
        <ClimbForm
          gyms={gyms}
          onSubmit={handleAdd}
          onCancel={() => setShowForm(false)}
          defaultGymId={filterGymId !== 'all' ? filterGymId : undefined}
        />
      </PageShell>
    )
  }

  const filtered = (filterGymId === 'all' ? climbs : climbs.filter((c) => c.gymId === filterGymId))
    .filter((c) => c.date.startsWith(calMonth))

  // 날짜별 그룹핑 (calMonth 안에서만)
  const grouped = filtered.reduce((acc, climb) => {
    if (!acc[climb.date]) acc[climb.date] = []
    acc[climb.date].push(climb)
    return acc
  }, {})

  const dateKeys = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  return (
    <PageShell
      title="방문 기록"
      action={
        <button onClick={() => setShowForm(true)} className="btn-primary text-sm" style={{ height: 36, padding: '0 16px' }}>
          + 기록 추가
        </button>
      }
    >
      {/* 월 캘린더 */}
      <MonthCalendar
        climbs={climbs}
        month={calMonth}
        onMonthChange={(delta) => setCalMonth((prev) => offsetMonth(prev, delta))}
      />

      {/* 암장 필터 */}
      {gyms.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-5">
          <button
            onClick={() => setFilterGymId('all')}
            className="px-3 py-1.5 rounded-full text-sm font-medium border transition-colors"
            style={{
              backgroundColor: filterGymId === 'all' ? '#D88CA6' : '#fff',
              color: filterGymId === 'all' ? '#fff' : '#888780',
              borderColor: filterGymId === 'all' ? '#D88CA6' : '#EDD0DC',
            }}
          >
            전체
          </button>
          {gyms.map((g) => (
            <button
              key={g.id}
              onClick={() => setFilterGymId(filterGymId === g.id ? 'all' : g.id)}
              className="px-3 py-1.5 rounded-full text-sm font-medium border transition-colors"
              style={{
                backgroundColor: filterGymId === g.id ? '#D88CA6' : '#fff',
                color: filterGymId === g.id ? '#fff' : '#888780',
                borderColor: filterGymId === g.id ? '#D88CA6' : '#EDD0DC',
              }}
            >
              {g.name}
            </button>
          ))}
        </div>
      )}

      {/* 목록 */}
      {loading ? (
        <p className="text-sm text-center py-12" style={{ color: '#888780' }}>불러오는 중…</p>
      ) : dateKeys.length === 0 ? (
        <div className="text-center py-12">
          <p className="font-medium" style={{ color: '#888780' }}>이 달의 기록이 없어요</p>
        </div>
      ) : (
        <div className="space-y-3">
          {dateKeys.map((date) => (
            <DayCard
              key={date}
              date={date}
              climbs={grouped[date]}
              onDelete={deleteClimb}
              onUpdate={updateClimb}
            />
          ))}
        </div>
      )}
    </PageShell>
  )
}
