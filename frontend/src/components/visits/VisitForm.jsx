import { useState, useEffect } from 'react'

function today() {
  return new Date().toISOString().slice(0, 10)
}

export default function VisitForm({ gyms, onSubmit, onCancel }) {
  const [date, setDate] = useState(today())
  const [gymId, setGymId] = useState(gyms[0]?.id ?? '')
  const [memo, setMemo] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!gymId && gyms.length > 0) setGymId(gyms[0].id)
  }, [gyms, gymId])

  const selectedGym = gyms.find((g) => g.id === gymId)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!gymId) return
    setSaving(true)
    await onSubmit({
      date,
      gymId,
      gymName: selectedGym.name,
      memo: memo.trim(),
    })
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
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

      <div>
        <label className="input-label">암장</label>
        {gyms.length === 0 ? (
          <p className="text-sm text-gray-400">등록된 암장이 없어요.</p>
        ) : (
          <select
            value={gymId}
            onChange={(e) => setGymId(e.target.value)}
            className="input-field"
          >
            {gyms.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        )}
      </div>

      <div>
        <label className="input-label">
          메모 <span style={{ color: '#BBBBBB', fontWeight: 400 }}>(선택)</span>
        </label>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="오늘 컨디션, 같이 간 사람 등"
          rows={3}
          className="input-field"
          style={{ height: 'auto', paddingTop: 12, paddingBottom: 12, resize: 'none' }}
        />
      </div>

      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">
          취소
        </button>
        <button type="submit" disabled={!gymId || saving} className="btn-primary flex-1">
          {saving ? '저장 중…' : '방문 기록'}
        </button>
      </div>
    </form>
  )
}
