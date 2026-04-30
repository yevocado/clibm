import { useState } from 'react'
import { ChevronUp, ChevronDown, X } from 'lucide-react'

const PRESET_COLORS = [
  { label: '흰색',   hex: '#FFFFFF' },
  { label: '연회색', hex: '#E5E7EB' },
  { label: '회색',   hex: '#6B7280' },
  { label: '검은색', hex: '#1F2937' },
  { label: '빨간색', hex: '#EF4444' },
  { label: '주황색', hex: '#F97316' },
  { label: '노란색', hex: '#FACC15' },
  { label: '연두색', hex: '#84CC16' },
  { label: '초록색', hex: '#22C55E' },
  { label: '민트',   hex: '#10B981' },
  { label: '하늘색', hex: '#38BDF8' },
  { label: '파란색', hex: '#3B82F6' },
  { label: '남색',   hex: '#3730A3' },
  { label: '보라색', hex: '#A855F7' },
  { label: '분홍색', hex: '#EC4899' },
  { label: '갈색',   hex: '#92400E' },
]

function ColorDotGrid({ selected, onSelect }) {
  return (
    <div
      className="flex flex-wrap gap-2 p-3 rounded-xl mt-1"
      style={{ background: 'var(--color-primary-light-alt)', border: '1px solid #EDD0DC' }}
    >
      {PRESET_COLORS.map((c) => (
        <button
          key={c.hex}
          type="button"
          onClick={() => onSelect(c)}
          title={c.label}
          className="rounded-full transition-transform"
          style={{
            width: 32,
            height: 32,
            backgroundColor: c.hex,
            border: selected === c.hex
              ? '3px solid var(--color-primary)'
              : (c.hex === '#FFFFFF' || c.hex === '#E5E7EB')
              ? '1.5px solid #EDD0DC'
              : '1.5px solid transparent',
            boxShadow: selected === c.hex ? '0 0 0 2px #FFF8FB, 0 0 0 4px #D88CA6' : undefined,
            transform: selected === c.hex ? 'scale(1.15)' : 'scale(1)',
          }}
        />
      ))}
    </div>
  )
}

export default function ColorPaletteEditor({ colors, onChange }) {
  const [openIdx, setOpenIdx] = useState(null)

  const move = (index, dir) => {
    const next = [...colors]
    const swapIdx = index + dir
    if (swapIdx < 0 || swapIdx >= next.length) return
    ;[next[index], next[swapIdx]] = [next[swapIdx], next[index]]
    onChange(next)
  }

  const updateLabel = (index, label) => {
    const next = [...colors]
    next[index] = { ...next[index], label }
    onChange(next)
  }

  const remove = (index) => {
    onChange(colors.filter((_, i) => i !== index))
    if (openIdx === index) setOpenIdx(null)
  }

  const selectColor = (index, preset) => {
    const next = [...colors]
    next[index] = { hex: preset.hex, label: preset.label }
    onChange(next)
    setOpenIdx(null)
  }

  const addColor = (preset) => {
    onChange([...colors, { label: preset.label, hex: preset.hex }])
    setOpenIdx(null)
  }

  return (
    <div className="space-y-2">
      {colors.map((color, i) => (
        <div key={i}>
          <div
            className="flex items-center gap-2 rounded-xl px-3 py-2"
            style={{ background: '#FFF0F4', border: '1px solid #F0E0E5' }}
          >
            <button
              type="button"
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
              className="w-8 h-8 rounded-full shrink-0 transition-transform"
              style={{
                backgroundColor: color.hex,
                border: '2px solid #fff',
                boxShadow: '0 0 0 1.5px #EDD0DC',
                transform: openIdx === i ? 'scale(1.1)' : 'scale(1)',
              }}
            />
            <input
              type="text"
              value={color.label}
              onChange={(e) => updateLabel(i, e.target.value)}
              className="flex-1 input-field"
              style={{ height: 36, fontSize: 14 }}
            />
            <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="btn-ghost disabled:opacity-20 p-0.5">
              <ChevronUp size={16} />
            </button>
            <button type="button" onClick={() => move(i, 1)} disabled={i === colors.length - 1} className="btn-ghost disabled:opacity-20 p-0.5">
              <ChevronDown size={16} />
            </button>
            <button type="button" onClick={() => remove(i)} className="btn-ghost p-0.5" style={{ color: '#BBBBBB' }}>
              <X size={16} />
            </button>
          </div>
          {openIdx === i && (
            <ColorDotGrid selected={color.hex} onSelect={(preset) => selectColor(i, preset)} />
          )}
        </div>
      ))}

      <div>
        <button
          type="button"
          onClick={() => setOpenIdx(openIdx === 'new' ? null : 'new')}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-colors"
          style={{ border: '1.5px dashed #EDD0DC', color: 'var(--color-primary)', background: 'transparent' }}
        >
          + 색상 추가
        </button>
        {openIdx === 'new' && (
          <ColorDotGrid selected={null} onSelect={addColor} />
        )}
      </div>
    </div>
  )
}
