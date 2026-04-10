import { useState } from 'react'
import { Trash2, Trophy } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useGoals } from '../hooks/useGoals'
import { useClimbs } from '../hooks/useClimbs'
import PageShell from '../components/layout/PageShell'

const LEVELS = [1,2,3,4,5,6,7,8,9,10,11]

function GoalForm({ onSubmit, onCancel }) {
  const [targetLevel, setTargetLevel] = useState(null)
  const [deadline, setDeadline] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!targetLevel) return
    setSaving(true)
    await onSubmit({ targetLevel, deadline })
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="input-label">목표 레벨</label>
        <div className="flex flex-wrap gap-2 mt-1">
          {LEVELS.map((lv) => (
            <button
              key={lv}
              type="button"
              onClick={() => setTargetLevel(targetLevel === lv ? null : lv)}
              className="px-3 py-1.5 rounded-full text-sm font-semibold border transition-colors"
              style={{
                backgroundColor: targetLevel === lv ? '#E8366F' : '#fff',
                color: targetLevel === lv ? '#fff' : '#666',
                borderColor: targetLevel === lv ? '#E8366F' : '#F0E0E5',
              }}
            >
              Lv.{lv}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="input-label">
          목표 기한 <span style={{ color: '#BBBBBB', fontWeight: 400 }}>(선택)</span>
        </label>
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="input-field"
        />
      </div>

      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">
          취소
        </button>
        <button type="submit" disabled={!targetLevel || saving} className="btn-primary flex-1">
          {saving ? '저장 중…' : '목표 설정'}
        </button>
      </div>
    </form>
  )
}

function GoalCard({ goal, currentBest, onDelete }) {
  const targetNum = goal.targetLevel ?? 0
  const currentNum = currentBest ?? 0
  const progress = targetNum <= 0 ? 0 : Math.min(100, Math.round((currentNum / targetNum) * 100))
  const achieved = currentNum >= targetNum

  const daysLeft = goal.deadline
    ? Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {achieved && <Trophy size={18} style={{ color: '#F59E0B' }} />}
          <span className="font-bold text-lg" style={{ color: achieved ? '#F59E0B' : '#1A1A1A' }}>
            Lv.{goal.targetLevel}
          </span>
          {achieved && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: '#FEF3C7', color: '#D97706' }}>
              달성!
            </span>
          )}
        </div>
        <button
          onClick={() => { if (confirm('목표를 삭제할까요?')) onDelete(goal.id) }}
          className="btn-ghost p-1"
          style={{ color: '#BBBBBB' }}
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="mb-2">
        <div className="flex justify-between text-xs text-gray-400 mb-1.5">
          <span>현재 {currentBest ? `Lv.${currentBest}` : '-'}</span>
          <span>{progress}%</span>
        </div>
        <div className="progress-bar-track">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {goal.deadline && (
        <p className="text-xs text-gray-400 mt-2">
          {daysLeft !== null && daysLeft >= 0
            ? `D-${daysLeft} · ${goal.deadline}`
            : `기한 지남 · ${goal.deadline}`}
        </p>
      )}
    </div>
  )
}

export default function GoalPage() {
  const { user } = useAuth()
  const { goals, loading, addGoal, deleteGoal } = useGoals(user?.uid)
  const { climbs } = useClimbs(user?.uid)
  const [showForm, setShowForm] = useState(false)

  // 현재 최고 레벨
  const currentBest = climbs.reduce((best, c) => {
    return (c.gradeLevel ?? 0) > best ? (c.gradeLevel ?? 0) : best
  }, 0)

  const handleAdd = async (data) => {
    await addGoal(data)
    setShowForm(false)
  }

  if (showForm) {
    return (
      <PageShell title="목표 설정">
        <GoalForm onSubmit={handleAdd} onCancel={() => setShowForm(false)} />
      </PageShell>
    )
  }

  return (
    <PageShell
      title="목표"
      action={
        <button onClick={() => setShowForm(true)} className="btn-primary text-sm px-4 py-2" style={{ height: 40 }}>
          + 목표 추가
        </button>
      }
    >
      {loading ? (
        <p className="text-gray-400 text-sm text-center py-12">불러오는 중…</p>
      ) : goals.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🎯</div>
          <p className="text-gray-500 font-medium">설정된 목표가 없어요</p>
          <p className="text-gray-400 text-sm mt-1">도전할 V등급을 설정해 보세요!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              currentBest={currentBest}
              onDelete={deleteGoal}
            />
          ))}
        </div>
      )}
    </PageShell>
  )
}
