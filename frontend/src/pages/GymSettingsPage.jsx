import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useGyms } from '../hooks/useGyms'
import { GYM_PRESETS } from '../constants/gymPresets'
import GymForm from '../components/gyms/GymForm'
import PageShell from '../components/layout/PageShell'

export default function GymSettingsPage() {
  const { user } = useAuth()
  const { gyms, loading, addGym, updateGym, deleteGym } = useGyms(user?.uid)
  const [mode, setMode] = useState(null) // null | 'add' | { edit: gym }

  const handleAdd = async (data) => {
    await addGym(data)
    setMode(null)
  }

  const handleUpdate = async (data) => {
    await updateGym(mode.edit.id, data)
    setMode(null)
  }

  const handleDelete = async (gymId) => {
    if (!confirm('암장을 삭제하면 관련 기록의 색상 정보가 표시되지 않을 수 있습니다. 삭제할까요?')) return
    await deleteGym(gymId)
  }

  const handlePreset = async (preset) => {
    const existing = gyms.find((g) => g.name === preset.name)
    if (existing) {
      await deleteGym(existing.id)
    } else {
      await addGym(preset)
    }
  }

  // 폼 화면
  if (mode === 'add') {
    return (
      <PageShell title="새 암장 추가">
        <GymForm onSubmit={handleAdd} onCancel={() => setMode(null)} />
      </PageShell>
    )
  }
  if (mode?.edit) {
    return (
      <PageShell title="암장 편집">
        <GymForm
          initial={mode.edit}
          onSubmit={handleUpdate}
          onCancel={() => setMode(null)}
        />
      </PageShell>
    )
  }

  return (
    <PageShell
      title="암장 관리"
      action={
        <button
          onClick={() => setMode('add')}
          className="btn-primary text-sm px-4 py-2"
        >
          + 추가
        </button>
      }
    >
      {/* 프리셋 */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          프리셋으로 빠르게 추가
        </p>
        <div className="flex flex-wrap gap-2">
          {GYM_PRESETS.map((preset) => {
            const added = gyms.some((g) => g.name === preset.name)
            return (
              <button
                key={preset.name}
                onClick={() => handlePreset(preset)}
                className="px-3 py-1.5 rounded-full text-sm font-medium border transition-colors"
                style={{
                  backgroundColor: added ? '#E8366F' : '#fff',
                  color: added ? '#fff' : '#E8366F',
                  borderColor: added ? '#E8366F' : '#F9839E',
                }}
              >
                {added ? '✓ ' : ''}{preset.name}
              </button>
            )
          })}
        </div>
      </div>

      {/* 암장 목록 */}
      {loading ? (
        <p className="text-gray-400 text-sm text-center py-8">불러오는 중…</p>
      ) : gyms.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🏟️</div>
          <p className="text-gray-500 font-medium">등록된 암장이 없어요</p>
          <p className="text-gray-400 text-sm mt-1">프리셋이나 직접 추가해 보세요</p>
        </div>
      ) : (
        <div className="space-y-3">
          {gyms.map((gym) => (
            <div key={gym.id} className="card">
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-gray-900">{gym.name}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setMode({ edit: gym })}
                    className="text-xs text-primary-500 hover:text-primary-700 font-medium"
                  >
                    편집
                  </button>
                  <button
                    onClick={() => handleDelete(gym.id)}
                    className="text-xs text-gray-400 hover:text-red-400 font-medium"
                  >
                    삭제
                  </button>
                </div>
              </div>

              {/* 색상 팔레트 미리보기 */}
              <div className="flex flex-wrap gap-1.5">
                {(gym.colors ?? []).map((c) => (
                  <div key={c.level} className="flex flex-col items-center gap-0.5">
                    <div
                      className="w-7 h-7 rounded-full border-2 border-white shadow"
                      style={{ backgroundColor: c.hex }}
                      title={`${c.label} (lv.${c.level})`}
                    />
                    <span className="text-gray-400" style={{ fontSize: '9px' }}>
                      {c.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  )
}
