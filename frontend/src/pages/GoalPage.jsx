import { useState } from 'react'
import { Trash2, Trophy } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useGoals } from '../hooks/useGoals'
import { useClimbs } from '../hooks/useClimbs'
import PageShell from '../components/layout/PageShell'
import { useGymBrands, getBrandName } from '../hooks/useGymBrands'

function GoalForm({ onSubmit, onCancel, brands }) {
  const [gymBrand, setGymBrand] = useState(null)
  const [targetColor, setTargetColor] = useState(null)
  const [targetCount, setTargetCount] = useState(10)
  const [deadline, setDeadline] = useState('')
  const [saving, setSaving] = useState(false)

  const colors = gymBrand ? (brands.find((b) => b.name === gymBrand)?.colors ?? []) : []

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!gymBrand || !targetColor) return
    setSaving(true)
    await onSubmit({ gymBrand, targetColor, targetCount, deadline })
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* 암장 브랜드 */}
      <div>
        <label className="input-label">암장</label>
        <div className="flex flex-wrap gap-2 mt-1">
          {brands.map((b) => (
            <button
              key={b.name}
              type="button"
              onClick={() => { setGymBrand(b.name); setTargetColor(null) }}
              className="px-3 py-1.5 rounded-full text-sm font-medium border transition-colors"
              style={{
                backgroundColor: gymBrand === b.name ? '#D88CA6' : '#fff',
                color: gymBrand === b.name ? '#fff' : '#888780',
                borderColor: gymBrand === b.name ? '#D88CA6' : '#EDD0DC',
              }}
            >
              {b.name}
            </button>
          ))}
        </div>
      </div>

      {/* 색깔 선택 */}
      {gymBrand && (
        <div>
          <label className="input-label">목표 색깔</label>
          <div className="flex flex-wrap gap-3 mt-2">
            {colors.map((c) => {
              const selected = targetColor?.level === c.level
              return (
                <button
                  key={c.level}
                  type="button"
                  onClick={() => setTargetColor(selected ? null : c)}
                  className="flex flex-col items-center gap-1"
                >
                  <div
                    className="rounded-full"
                    style={{
                      width: 40, height: 40,
                      backgroundColor: c.hex,
                      border: selected ? '3px solid #D88CA6' : '1.5px solid #EDD0DC',
                      boxShadow: selected ? '0 0 0 3px #F4C0D1' : 'none',
                      transition: 'box-shadow 0.15s, border-color 0.15s',
                    }}
                  />
                  <span style={{
                    fontSize: 10,
                    color: selected ? '#B5607E' : '#888780',
                    fontWeight: selected ? 600 : 400,
                  }}>
                    {c.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* 목표 개수 */}
      {targetColor && (
        <div>
          <label className="input-label">목표 개수</label>
          <div className="flex items-center gap-2 mt-1">
            <button
              type="button"
              onClick={() => setTargetCount((n) => Math.max(1, n - 5))}
              className="btn-secondary text-xs"
              style={{ height: 36, padding: '0 10px' }}
            >−5</button>
            <button
              type="button"
              onClick={() => setTargetCount((n) => Math.max(1, n - 1))}
              className="btn-secondary"
              style={{ width: 36, height: 36, padding: 0, fontSize: 20, lineHeight: 1 }}
            >−</button>
            <span className="font-bold text-2xl w-12 text-center" style={{ color: '#444441' }}>{targetCount}</span>
            <button
              type="button"
              onClick={() => setTargetCount((n) => n + 1)}
              className="btn-secondary"
              style={{ width: 36, height: 36, padding: 0, fontSize: 20, lineHeight: 1 }}
            >+</button>
            <button
              type="button"
              onClick={() => setTargetCount((n) => n + 5)}
              className="btn-secondary text-xs"
              style={{ height: 36, padding: '0 10px' }}
            >+5</button>
            <span className="text-sm ml-1" style={{ color: '#888780' }}>개</span>
          </div>
        </div>
      )}

      {/* 기한 */}
      <div>
        <label className="input-label">
          기한 <span style={{ color: '#D3D1C7', fontWeight: 400 }}>(선택)</span>
        </label>
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="input-field"
        />
      </div>

      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">취소</button>
        <button
          type="submit"
          disabled={!gymBrand || !targetColor || saving}
          className="btn-primary flex-1"
        >
          {saving ? '저장 중…' : '목표 설정'}
        </button>
      </div>
    </form>
  )
}


function GoalCard({ goal, currentCount, onDelete }) {
  const targetNum = goal.targetCount ?? goal.targetLevel ?? 1
  const progress = Math.min(100, Math.round((currentCount / targetNum) * 100))
  const achieved = currentCount >= targetNum
  const hex = goal.targetColor?.hex ?? '#D88CA6'

  const daysLeft = goal.deadline
    ? Math.ceil((new Date(goal.deadline + 'T00:00:00') - new Date()) / 86400000)
    : null

  return (
    <div className="card" style={{ padding: '12px 14px' }}>
      {/* 한 줄 헤더 */}
      <div className="flex items-center gap-2.5 mb-2">
        <div className="rounded-full shrink-0" style={{ width: 24, height: 24, backgroundColor: hex, border: '1.5px solid #EDD0DC' }} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs" style={{ color: '#888780' }}>{goal.gymBrand ?? '전체'}</span>
            <span style={{ color: '#D3D1C7', fontSize: 10 }}>·</span>
            <span className="font-semibold text-sm" style={{ color: achieved ? '#F59E0B' : '#444441' }}>
              {goal.targetColor?.label ?? `Lv.${goal.targetLevel}`}
            </span>
            <span className="text-sm font-semibold" style={{ color: '#D88CA6' }}>{targetNum}개</span>
            {achieved && <Trophy size={12} style={{ color: '#F59E0B' }} />}
            {achieved && (
              <span className="text-xs font-medium px-1.5 py-0.5 rounded-full" style={{ background: '#FEF3C7', color: '#D97706' }}>달성!</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="font-bold text-sm" style={{ color: '#B5607E' }}>{progress}%</span>
          <button
            onClick={() => { if (confirm('목표를 삭제할까요?')) onDelete(goal.id) }}
            className="p-0.5"
            style={{ color: '#D3D1C7' }}
            onMouseEnter={e => e.currentTarget.style.color = '#888780'}
            onMouseLeave={e => e.currentTarget.style.color = '#D3D1C7'}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* 프로그레스 바 */}
      <div className="progress-bar-track mb-2">
        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* 하단 메타 */}
      <div className="flex justify-between items-center">
        <span className="text-xs" style={{ color: '#888780' }}>{currentCount} / {targetNum}개</span>
        {goal.deadline && (
          <span className="text-xs" style={{ color: daysLeft !== null && daysLeft < 0 ? '#D88CA6' : '#888780' }}>
            {daysLeft !== null && daysLeft >= 0 ? `D-${daysLeft} · ${goal.deadline}` : `기한 지남 · ${goal.deadline}`}
          </span>
        )}
      </div>
    </div>
  )
}

export default function GoalPage() {
  const { user } = useAuth()
  const { goals, loading, addGoal, deleteGoal } = useGoals(user?.uid)
  const { climbs } = useClimbs(user?.uid)
  const { brands } = useGymBrands()
  const [showForm, setShowForm] = useState(false)

  const getProgressCount = (goal) => {
    if (goal.targetColor && goal.gymBrand) {
      return climbs.reduce((sum, c) => {
        if (getBrandName(c.gymName, brands) !== goal.gymBrand) return sum
        if (c.grade !== goal.targetColor.label) return sum
        return sum + (c.count ?? 1)
      }, 0)
    }
    // 구형 레벨 목표 호환
    return climbs.reduce((best, c) => Math.max(best, c.gradeLevel ?? 0), 0)
  }

  const handleAdd = async (data) => {
    await addGoal(data)
    setShowForm(false)
  }

  if (showForm) {
    return (
      <PageShell title="목표 설정">
        <GoalForm onSubmit={handleAdd} onCancel={() => setShowForm(false)} brands={brands} />
      </PageShell>
    )
  }

  return (
    <PageShell
      title="목표"
      action={
        <button onClick={() => setShowForm(true)} className="btn-primary text-sm" style={{ height: 36, padding: '0 16px' }}>
          + 목표 추가
        </button>
      }
    >
      {loading ? (
        <p className="text-sm text-center py-12" style={{ color: '#888780' }}>불러오는 중…</p>
      ) : goals.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🎯</div>
          <p className="font-medium" style={{ color: '#444441' }}>설정된 목표가 없어요</p>
          <p className="text-sm mt-1" style={{ color: '#888780' }}>암장과 색깔을 선택해 완등 목표를 정해보세요</p>
        </div>
      ) : (
        <div className="space-y-3">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              currentCount={getProgressCount(goal)}
              onDelete={deleteGoal}
            />
          ))}
        </div>
      )}
    </PageShell>
  )
}
