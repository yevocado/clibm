import { ChevronUp, ChevronDown, X, Plus } from 'lucide-react'

export default function ColorPaletteEditor({ colors, onChange }) {
  const move = (index, dir) => {
    const next = [...colors]
    const swapIdx = index + dir
    if (swapIdx < 0 || swapIdx >= next.length) return
    ;[next[index], next[swapIdx]] = [next[swapIdx], next[index]]
    onChange(next.map((c, i) => ({ ...c, level: i + 1 })))
  }

  const update = (index, field, value) => {
    const next = [...colors]
    next[index] = { ...next[index], [field]: value }
    onChange(next)
  }

  const remove = (index) => {
    const next = colors.filter((_, i) => i !== index)
    onChange(next.map((c, i) => ({ ...c, level: i + 1 })))
  }

  const add = () => {
    onChange([...colors, { label: '새 색상', hex: '#E8366F', level: colors.length + 1 }])
  }

  return (
    <div className="space-y-2">
      {colors.map((color, i) => (
        <div
          key={i}
          className="flex items-center gap-2 rounded-input px-3 py-2"
          style={{ background: '#FFF0F4', border: '1px solid #F0E0E5' }}
        >
          <span className="text-xs w-5 text-center font-mono" style={{ color: '#BBBBBB' }}>{i + 1}</span>

          {/* 컬러피커 */}
          <div className="relative w-8 h-8 shrink-0">
            <input
              type="color"
              value={color.hex}
              onChange={(e) => update(i, 'hex', e.target.value)}
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
            />
            <div
              className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
              style={{ backgroundColor: color.hex }}
            />
          </div>

          <input
            type="text"
            value={color.label}
            onChange={(e) => update(i, 'label', e.target.value)}
            className="flex-1 input-field"
            style={{ height: 36, fontSize: 14 }}
          />

          <button onClick={() => move(i, -1)} disabled={i === 0} className="btn-ghost disabled:opacity-20 p-0.5">
            <ChevronUp size={16} />
          </button>
          <button onClick={() => move(i, 1)} disabled={i === colors.length - 1} className="btn-ghost disabled:opacity-20 p-0.5">
            <ChevronDown size={16} />
          </button>
          <button onClick={() => remove(i)} className="btn-ghost p-0.5" style={{ color: '#BBBBBB' }}>
            <X size={16} />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={add}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-input text-sm font-semibold transition-colors"
        style={{ border: '1.5px dashed #F0E0E5', color: '#E8366F', background: 'transparent' }}
        onMouseEnter={e => e.currentTarget.style.background = '#FFF0F4'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <Plus size={16} /> 색상 추가
      </button>
    </div>
  )
}
