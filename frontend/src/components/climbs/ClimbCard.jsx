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
          border: '2px solid #F0E0E5',
          boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
        }}
      />

      {/* 내용 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-gray-800 text-sm">{grade}</span>
        </div>
        <p className="text-xs text-gray-400 mb-1">
          {gymName} · {formattedDate}
        </p>
        {memo && (
          <p className="text-sm text-gray-500 mt-1 leading-snug">{memo}</p>
        )}
      </div>

      {/* 삭제 */}
      <button
        onClick={handleDelete}
        className="btn-ghost shrink-0 p-1"
        style={{ color: '#BBBBBB' }}
      >
        <Trash2 size={16} />
      </button>
    </div>
  )
}
