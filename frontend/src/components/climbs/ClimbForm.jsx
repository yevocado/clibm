import { useState, useEffect } from 'react'

function today() {
  return new Date().toISOString().slice(0, 10)
}

export default function ClimbForm({ gyms, onSubmit, onCancel }) {
  const [date, setDate] = useState(today())
  const [gymId, setGymId] = useState(gyms[0]?.id ?? '')
  const [colorLevel, setColorLevel] = useState(null) // level number
  const [memo, setMemo] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!gymId && gyms.length > 0) setGymId(gyms[0].id)
  }, [gyms, gymId])

  const selectedGym = gyms.find((g) => g.id === gymId)
  const colors = selectedGym?.colors ?? []

  // 암장 변경 시 색상 선택 초기화
  const handleGymChange = (id) => {
    setGymId(id)
    setColorLevel(null)
  }

  const selectedColor = colors.find((c) => c.level === colorLevel)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!gymId || colorLevel === null) return
    setSaving(true)
    await onSubmit({
      date,
      gymId,
      gymName: selectedGym.name,
      grade: selectedColor.label,
      gradeColor: selectedColor.hex,
      gradeLevel: selectedColor.level,
      memo: memo.trim(),
    })
    setSaving(false)
  }

  const canSubmit = gymId && colorLevel !== null && !saving

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* 날짜 */}
      <div>
        <label className="input-label">날짜</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="input-field"
          required
        />
      </div>

      {/* 암장 */}
      <div>
        <label className="input-label">암장</label>
        {gyms.length === 0 ? (
          <p className="text-sm text-gray-400">등록된 암장이 없어요. 먼저 암장을 추가해 주세요.</p>
        ) : (
          <select
            value={gymId}
            onChange={(e) => handleGymChange(e.target.value)}
            className="input-field"
          >
            {gyms.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* 색상 (난이도) */}
      <div>
        <label className="input-label">
          색상 <span style={{ color: '#BBBBBB', fontWeight: 400 }}>(난이도)</span>
        </label>
        {colors.length === 0 ? (
          <p className="text-sm text-gray-400">이 암장에 색상이 등록되지 않았어요.</p>
        ) : (
          <div className="flex flex-wrap gap-3 mt-1">
            {colors.map((c) => (
              <button
                key={c.level}
                type="button"
                onClick={() => setColorLevel(colorLevel === c.level ? null : c.level)}
                className="flex flex-col items-center gap-1"
              >
                <div
                  className="rounded-full transition-transform"
                  style={{
                    width: 36,
                    height: 36,
                    backgroundColor: c.hex,
                    border: colorLevel === c.level
                      ? '3px solid #E8366F'
                      : '2px solid #F0E0E5',
                    transform: colorLevel === c.level ? 'scale(1.15)' : 'scale(1)',
                    boxShadow: colorLevel === c.level
                      ? '0 0 0 2px #fff, 0 0 0 4px #E8366F'
                      : 'none',
                  }}
                />
                <span style={{ fontSize: 10, color: colorLevel === c.level ? '#E8366F' : '#999' }}>
                  {c.label}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 메모 */}
      <div>
        <label className="input-label">
          메모 <span style={{ color: '#BBBBBB', fontWeight: 400 }}>(선택)</span>
        </label>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="느낌, 베타, 특이사항 등"
          rows={3}
          className="input-field"
          style={{ height: 'auto', paddingTop: 12, paddingBottom: 12, resize: 'none' }}
        />
      </div>

      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">
          취소
        </button>
        <button type="submit" disabled={!canSubmit} className="btn-primary flex-1">
          {saving ? '저장 중…' : '완등 기록'}
        </button>
      </div>
    </form>
  )
}
