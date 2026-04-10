import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useVisits } from '../hooks/useVisits'
import { useGyms } from '../hooks/useGyms'
import VisitForm from '../components/visits/VisitForm'
import PageShell from '../components/layout/PageShell'

function formatDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  })
}

function formatMonth(key) {
  const [y, m] = key.split('-')
  return `${y}년 ${parseInt(m)}월`
}

export default function VisitsPage() {
  const { user } = useAuth()
  const { visits, loading, addVisit, deleteVisit } = useVisits(user?.uid)
  const { gyms } = useGyms(user?.uid)
  const [showForm, setShowForm] = useState(false)

  const handleAdd = async (data) => {
    await addVisit(data)
    setShowForm(false)
  }

  const handleDelete = (id) => {
    if (!confirm('이 방문 기록을 삭제할까요?')) return
    deleteVisit(id)
  }

  if (showForm) {
    return (
      <PageShell title="방문 기록 추가">
        <VisitForm gyms={gyms} onSubmit={handleAdd} onCancel={() => setShowForm(false)} />
      </PageShell>
    )
  }

  // 이번달 방문 횟수
  const thisMonth = new Date().toISOString().slice(0, 7)
  const thisMonthCount = visits.filter((v) => v.date.startsWith(thisMonth)).length

  // 월별 그룹핑
  const grouped = visits.reduce((acc, v) => {
    const key = v.date.slice(0, 7)
    if (!acc[key]) acc[key] = []
    acc[key].push(v)
    return acc
  }, {})
  const monthKeys = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  return (
    <PageShell
      title="방문 기록"
      action={
        <button onClick={() => setShowForm(true)} className="btn-primary text-sm px-4 py-2" style={{ height: 40 }}>
          + 방문 추가
        </button>
      }
    >
      {/* 이번달 요약 */}
      {!loading && (
        <div className="card mb-5 flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
            style={{ background: '#FFF0F4' }}
          >
            🏟️
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">이번달 방문</p>
            <p className="font-bold text-2xl" style={{ color: '#E8366F' }}>
              {thisMonthCount}<span className="text-base font-medium text-gray-400 ml-1">회</span>
            </p>
          </div>
        </div>
      )}

      {/* 목록 */}
      {loading ? (
        <p className="text-gray-400 text-sm text-center py-12">불러오는 중…</p>
      ) : visits.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">📍</div>
          <p className="text-gray-500 font-medium">방문 기록이 없어요</p>
          <p className="text-gray-400 text-sm mt-1">암장에 갔다면 기록해 두세요!</p>
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
                  {grouped[month].length}회
                </span>
                <div className="flex-1 h-px bg-pink-100" />
              </div>
              <div className="space-y-3">
                {grouped[month].map((v) => (
                  <div key={v.id} className="card flex items-start gap-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg"
                      style={{ background: '#FFF0F4' }}
                    >
                      🧗
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800">{v.gymName}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatDate(v.date)}</p>
                      {v.memo && <p className="text-sm text-gray-500 mt-1">{v.memo}</p>}
                    </div>
                    <button
                      onClick={() => handleDelete(v.id)}
                      className="btn-ghost p-1 shrink-0"
                      style={{ color: '#BBBBBB' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  )
}
