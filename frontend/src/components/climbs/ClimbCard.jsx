import { Trash2 } from 'lucide-react'

export default function ClimbCard({ climb, onDelete }) {
  const { date, gymName, grade, gradeColor, memo } = climb

  const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  })

  const handleDelete = () => {
    if (!confirm('이 기록을 삭제할까요?')) return
    onDelete(climb.id)
  }

  return (
    <div className="card flex items-start gap-4">
      {/* 색상 원 */}
      <div
        className="rounded-full shrink-0 mt-0.5"
        style={{
          width: 44,
          height: 44,
          backgroundColor: gradeColor,
          border: '1px solid var(--color-primary-border)',
        }}
      />

      {/* 내용 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-sm" style={{ color: '#444441' }}>{grade}</span>
          {climb.count > 1 && (
            <span
              className="text-xs font-medium px-1.5 py-0.5 rounded-full"
              style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary-dark)' }}
            >
              ×{climb.count}
            </span>
          )}
        </div>
        <p className="text-xs" style={{ color: '#888780' }}>
          {gymName} · {formattedDate}
        </p>
        {memo && (
          <p className="text-sm mt-1 leading-snug" style={{ color: '#888780' }}>{memo}</p>
        )}
      </div>

      {/* 삭제 */}
      <button
        onClick={handleDelete}
        className="shrink-0 p-1 transition-colors"
        style={{ color: '#D3D1C7' }}
        onMouseEnter={e => e.currentTarget.style.color = '#888780'}
        onMouseLeave={e => e.currentTarget.style.color = '#D3D1C7'}
      >
        <Trash2 size={16} />
      </button>
    </div>
  )
}
