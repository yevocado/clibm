import { useState } from 'react'
import ColorPaletteEditor from './ColorPaletteEditor'

export default function BrandForm({ onSubmit, onCancel }) {
  const [name, setName] = useState('')
  const [colors, setColors] = useState([])
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim() || colors.length === 0) return
    setSaving(true)
    await onSubmit({ name: name.trim(), colors, gymNames: [] })
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="input-label">브랜드 이름</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="예) 더볼더"
          className="input-field"
          required
        />
      </div>

      <div>
        <label className="input-label">
          난이도 색상 <span style={{ color: '#BBBBBB', fontWeight: 400 }}>(쉬운 순서대로)</span>
        </label>
        <ColorPaletteEditor colors={colors} onChange={setColors} />
      </div>

      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">취소</button>
        <button
          type="submit"
          disabled={saving || !name.trim() || colors.length === 0}
          className="btn-primary flex-1"
        >
          {saving ? '저장 중…' : '저장'}
        </button>
      </div>
    </form>
  )
}
