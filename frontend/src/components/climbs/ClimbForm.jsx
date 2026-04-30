import { useState, useEffect } from 'react'
import { useGymBrands, getBrandColors } from '../../hooks/useGymBrands'

function today() {
  return new Date().toISOString().slice(0, 10)
}

export default function ClimbForm({ gyms, onSubmit, onCancel, defaultGymId }) {
  const { brands } = useGymBrands()
  const initialGymId = defaultGymId ?? gyms[0]?.id ?? ''
  const [date, setDate] = useState(today())
  const [gymId, setGymId] = useState(initialGymId)
  const [selectedColors, setSelectedColors] = useState({})
  const [memo, setMemo] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!gymId && gyms.length > 0) setGymId(gyms[0].id)
  }, [gyms, gymId])

  const selectedGym = gyms.find((g) => g.id === gymId)
  const colors = selectedGym?.brandId
    ? getBrandColors(selectedGym.brandId, brands)
    : (selectedGym?.colors ?? [])

  const handleGymChange = (id) => {
    setGymId(id)
    setSelectedColors({})
  }

  const toggleColor = (idx) => {
    setSelectedColors((prev) => {
      if (prev[idx] !== undefined) {
        const next = { ...prev }
        delete next[idx]
        return next
      }
      return { ...prev, [idx]: 1 }
    })
  }

  const adjustCount = (idx, delta) => {
    setSelectedColors((prev) => {
      const newCount = (prev[idx] ?? 1) + delta
      if (newCount < 1) {
        const next = { ...prev }
        delete next[idx]
        return next
      }
      return { ...prev, [idx]: newCount }
    })
  }

  const totalSelected = Object.values(selectedColors).reduce((s, n) => s + n, 0)
  const canSubmit = gymId && totalSelected > 0 && !saving

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!canSubmit) return
    setSaving(true)
    setError(null)
    try {
      const entries = Object.entries(selectedColors).map(([idxStr, count]) => {
        const idx = Number(idxStr)
        const color = colors[idx]
        return {
          date,
          gymId,
          gymName: selectedGym.name,
          grade: color.label,
          gradeColor: color.hex,
          gradeLevel: idx + 1,
          count,
          memo: memo.trim(),
        }
      })
      await onSubmit(entries)
    } catch (err) {
      console.error(err)
      setError('저장에 실패했어요. 다시 시도해 주세요.')
      setSaving(false)
    }
  }

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
          <p className="text-sm" style={{ color: '#888780' }}>등록된 암장이 없어요. 먼저 암장을 추가해 주세요.</p>
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
          색상 <span style={{ color: '#D3D1C7', fontWeight: 400 }}>(여러 개 선택 가능)</span>
        </label>
        {colors.length === 0 ? (
          <p className="text-sm" style={{ color: '#888780' }}>이 암장에 색상이 등록되지 않았어요.</p>
        ) : (
          <div className="flex flex-wrap gap-4 mt-1">
            {colors.map((c, i) => {
              const sel = selectedColors[i]
              const isSelected = sel !== undefined
              return (
                <div key={i} className="flex flex-col items-center gap-1">
                  <button
                    type="button"
                    onClick={() => toggleColor(i)}
                    className="rounded-full transition-transform"
                    style={{
                      width: 40,
                      height: 40,
                      backgroundColor: c.hex,
                      border: isSelected ? '3px solid var(--color-primary)' : '1px solid var(--color-primary-border)',
                      transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                      boxShadow: isSelected
                        ? '0 0 0 2px #fff, 0 0 0 4px var(--color-primary)'
                        : 'none',
                    }}
                  />
                  <span style={{ fontSize: 10, color: isSelected ? 'var(--color-primary)' : '#888780' }}>
                    {c.label}
                  </span>
                  {isSelected && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <button
                        type="button"
                        onClick={() => adjustCount(i, -1)}
                        style={{
                          width: 20, height: 20, borderRadius: '50%',
                          background: 'var(--color-primary-light)', color: 'var(--color-primary)',
                          fontSize: 14, fontWeight: 700,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          border: '1px solid var(--color-primary-border)', cursor: 'pointer',
                        }}
                      >−</button>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-primary)', minWidth: 16, textAlign: 'center' }}>
                        {sel}
                      </span>
                      <button
                        type="button"
                        onClick={() => adjustCount(i, 1)}
                        style={{
                          width: 20, height: 20, borderRadius: '50%',
                          background: 'var(--color-primary)', color: '#fff',
                          fontSize: 14, fontWeight: 700,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          border: 'none', cursor: 'pointer',
                        }}
                      >+</button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 메모 */}
      <div>
        <label className="input-label">
          메모 <span style={{ color: '#D3D1C7', fontWeight: 400 }}>(선택)</span>
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

      {error && <p className="text-sm" style={{ color: 'var(--color-primary-hover)' }}>{error}</p>}

      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">
          취소
        </button>
        <button type="submit" disabled={!canSubmit} className="btn-primary flex-1">
          {saving ? '저장 중…' : totalSelected > 0 ? `${totalSelected}개 기록` : '완등 기록'}
        </button>
      </div>
    </form>
  )
}
