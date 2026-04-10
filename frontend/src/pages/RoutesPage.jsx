import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useClimbs } from '../hooks/useClimbs'
import { useGyms } from '../hooks/useGyms'
import ClimbForm from '../components/climbs/ClimbForm'
import ClimbCard from '../components/climbs/ClimbCard'
import PageShell from '../components/layout/PageShell'

export default function RoutesPage() {
  const { user } = useAuth()
  const { climbs, loading, addClimb, deleteClimb } = useClimbs(user?.uid)
  const { gyms } = useGyms(user?.uid)
  const [showForm, setShowForm] = useState(false)
  const [filterGymId, setFilterGymId] = useState('all')

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
        />
      </PageShell>
    )
  }

  const filtered = filterGymId === 'all'
    ? climbs
    : climbs.filter((c) => c.gymId === filterGymId)

  // 날짜별 그룹핑
  const grouped = filtered.reduce((acc, climb) => {
    const key = climb.date.slice(0, 7) // YYYY-MM
    if (!acc[key]) acc[key] = []
    acc[key].push(climb)
    return acc
  }, {})

  const monthKeys = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  const formatMonth = (key) => {
    const [y, m] = key.split('-')
    return `${y}년 ${parseInt(m)}월`
  }

  return (
    <PageShell
      title="방문 기록"
      action={
        <button onClick={() => setShowForm(true)} className="btn-primary text-sm px-4 py-2" style={{ height: 40 }}>
          + 기록 추가
        </button>
      }
    >
      {/* 암장 필터 */}
      {gyms.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-5">
          <button
            onClick={() => setFilterGymId('all')}
            className="px-3 py-1.5 rounded-full text-sm font-medium border transition-colors"
            style={{
              backgroundColor: filterGymId === 'all' ? '#E8366F' : '#fff',
              color: filterGymId === 'all' ? '#fff' : '#666',
              borderColor: filterGymId === 'all' ? '#E8366F' : '#F0E0E5',
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
                backgroundColor: filterGymId === g.id ? '#E8366F' : '#fff',
                color: filterGymId === g.id ? '#fff' : '#666',
                borderColor: filterGymId === g.id ? '#E8366F' : '#F0E0E5',
              }}
            >
              {g.name}
            </button>
          ))}
        </div>
      )}

      {/* 목록 */}
      {loading ? (
        <p className="text-gray-400 text-sm text-center py-12">불러오는 중…</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🧗</div>
          <p className="text-gray-500 font-medium">기록된 완등이 없어요</p>
          <p className="text-gray-400 text-sm mt-1">오늘 클라이밍한 루트를 추가해 보세요!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {monthKeys.map((month) => (
            <div key={month}>
              <div className="flex items-center gap-3 mb-3">
                <span className="font-bold text-sm" style={{ color: '#E8366F' }}>
                  {formatMonth(month)}
                </span>
                <span className="text-xs text-gray-400 font-medium">
                  {grouped[month].length}개
                </span>
                <div className="flex-1 h-px bg-pink-100" />
              </div>
              <div className="space-y-3">
                {grouped[month].map((climb) => (
                  <ClimbCard key={climb.id} climb={climb} onDelete={deleteClimb} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  )
}
