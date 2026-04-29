import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useGyms } from '../hooks/useGyms'
import { useGymBrands } from '../hooks/useGymBrands'
import GymForm from '../components/gyms/GymForm'
import BrandForm from '../components/gyms/BrandForm'
import PageShell from '../components/layout/PageShell'

export default function GymSettingsPage() {
  const { user } = useAuth()
  const { gyms, loading: gymsLoading, addGym, updateGym, deleteGym } = useGyms(user?.uid)
  const { brands, loading: brandsLoading, addBrand, deleteBrand, removeBranchFromBrand } = useGymBrands()
  const [mode, setMode] = useState(null) // null | 'addBrand' | 'addCustomGym' | { edit: gym }
  const [expandedBrand, setExpandedBrand] = useState(null) // brandId with open 지점 추가 input
  const [newBranchName, setNewBranchName] = useState('')

  const handleToggleBranch = async (gymName, brand) => {
    const existing = gyms.find((g) => g.name === gymName)
    if (existing) {
      await deleteGym(existing.id)
    } else {
      await addGym({ name: gymName, brandId: brand.id, brandName: brand.name })
    }
  }

  const handleDeleteBrand = async (brand) => {
    if (window.confirm(`'${brand.name}' 브랜드를 삭제할까요?`)) {
      await deleteBrand(brand.id)
    }
  }

  const handleRemovePresetBranch = async (name, brand) => {
    if (window.confirm(`'${name}'을 지점 목록에서 삭제할까요?`)) {
      const existing = gyms.find((g) => g.name === name)
      if (existing) await deleteGym(existing.id)
      await removeBranchFromBrand(brand.id, name)
    }
  }

  const handleAddBranch = async (brand) => {
    const trimmed = newBranchName.trim()
    if (!trimmed) return
    await addGym({ name: trimmed, brandId: brand.id, brandName: brand.name })
    setNewBranchName('')
    setExpandedBrand(null)
  }

  if (mode === 'addBrand') {
    return (
      <PageShell title="브랜드 추가">
        <BrandForm
          onSubmit={async (data) => { await addBrand(data); setMode(null) }}
          onCancel={() => setMode(null)}
        />
      </PageShell>
    )
  }

  if (mode === 'addCustomGym') {
    return (
      <PageShell title="커스텀 암장 추가">
        <GymForm
          onSubmit={async (data) => { await addGym(data); setMode(null) }}
          onCancel={() => setMode(null)}
        />
      </PageShell>
    )
  }

  if (mode?.edit) {
    return (
      <PageShell title="암장 편집">
        <GymForm
          initial={mode.edit}
          onSubmit={async (data) => { await updateGym(mode.edit.id, data); setMode(null) }}
          onCancel={() => setMode(null)}
        />
      </PageShell>
    )
  }

  const userGymNames = new Set(gyms.map((g) => g.name))
  const customGyms = gyms.filter((g) => !g.brandId)

  return (
    <PageShell title="암장 관리">
      {(gymsLoading || brandsLoading) ? (
        <p className="text-sm text-center py-12" style={{ color: '#888780' }}>불러오는 중…</p>
      ) : (
        <div className="space-y-3">
          {/* 브랜드 카드 */}
          {brands.map((brand) => {
            const presetNames = brand.gymNames ?? []
            const userBranchesOfBrand = gyms.filter((g) => g.brandId === brand.id)
            const customBranches = userBranchesOfBrand.filter((g) => !presetNames.includes(g.name))
            const isExpanded = expandedBrand === brand.id

            return (
              <div key={brand.id} className="card">
                {/* 브랜드 헤더 */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-semibold text-sm" style={{ color: '#444441' }}>{brand.name}</span>
                  <div className="flex gap-1 flex-wrap">
                    {brand.colors.map((c, i) => (
                      <div
                        key={i}
                        style={{
                          width: 12, height: 12, borderRadius: '50%',
                          backgroundColor: c.hex,
                          border: (c.hex === '#FFFFFF' || c.hex === '#E5E7EB') ? '0.5px solid #EDD0DC' : 'none',
                          flexShrink: 0,
                        }}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => handleDeleteBrand(brand)}
                    className="ml-auto text-xs font-medium"
                    style={{ color: '#D3D1C7' }}
                  >삭제</button>
                </div>

                {/* 지점 토글 칩 */}
                <div className="flex flex-wrap gap-2">
                  {presetNames.map((name) => {
                    const added = userGymNames.has(name)
                    return (
                      <div
                        key={name}
                        className="flex items-center rounded-full border text-xs font-medium overflow-hidden transition-colors"
                        style={{
                          backgroundColor: added ? '#D88CA6' : '#FBF0F4',
                          color: added ? '#fff' : '#B5607E',
                          borderColor: added ? '#D88CA6' : '#EDD0DC',
                        }}
                      >
                        <button
                          onClick={() => handleToggleBranch(name, brand)}
                          className="pl-3 pr-2 py-1.5"
                        >
                          {added ? '✓ ' : ''}{name}
                        </button>
                        <button
                          onClick={() => handleRemovePresetBranch(name, brand)}
                          className="pr-2.5 py-1.5 opacity-50 hover:opacity-100"
                        >×</button>
                      </div>
                    )
                  })}

                  {/* 프리셋에 없는 커스텀 지점 */}
                  {customBranches.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => { if (window.confirm(`${g.name}을 삭제할까요?`)) deleteGym(g.id) }}
                      className="px-3 py-1.5 rounded-full text-xs font-medium border"
                      style={{ backgroundColor: '#D88CA6', color: '#fff', borderColor: '#D88CA6' }}
                    >
                      ✓ {g.name} ×
                    </button>
                  ))}
                </div>

                {/* 지점 추가 인라인 입력 */}
                {isExpanded ? (
                  <div className="flex gap-2 mt-3">
                    <input
                      type="text"
                      value={newBranchName}
                      onChange={(e) => setNewBranchName(e.target.value)}
                      placeholder={`${brand.name} 지점명`}
                      className="input-field flex-1"
                      style={{ height: 36, fontSize: 13 }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') { e.preventDefault(); handleAddBranch(brand) }
                        if (e.key === 'Escape') { setExpandedBrand(null); setNewBranchName('') }
                      }}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => handleAddBranch(brand)}
                      className="btn-primary text-xs"
                      style={{ height: 36, padding: '0 12px' }}
                    >추가</button>
                    <button
                      type="button"
                      onClick={() => { setExpandedBrand(null); setNewBranchName('') }}
                      className="btn-secondary text-xs"
                      style={{ height: 36, padding: '0 12px' }}
                    >취소</button>
                  </div>
                ) : (
                  <button
                    onClick={() => { setExpandedBrand(brand.id); setNewBranchName('') }}
                    className="mt-3 text-xs font-medium"
                    style={{ color: '#D88CA6' }}
                  >
                    + 지점 추가
                  </button>
                )}
              </div>
            )
          })}

          {/* 커스텀 암장 (브랜드 없는 것) */}
          {customGyms.length > 0 && (
            <div className="card">
              <p className="text-sm font-semibold mb-3" style={{ color: '#444441' }}>커스텀 암장</p>
              <div className="space-y-3">
                {customGyms.map((gym) => (
                  <div key={gym.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {gym.colors?.map((c, i) => (
                          <div
                            key={i}
                            style={{
                              width: 12, height: 12, borderRadius: '50%',
                              backgroundColor: c.hex,
                              border: (c.hex === '#FFFFFF' || c.hex === '#E5E7EB') ? '0.5px solid #EDD0DC' : 'none',
                            }}
                          />
                        ))}
                      </div>
                      <span className="text-sm" style={{ color: '#444441' }}>{gym.name}</span>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setMode({ edit: gym })}
                        className="text-xs font-medium"
                        style={{ color: '#D88CA6' }}
                      >편집</button>
                      <button
                        onClick={() => { if (window.confirm(`${gym.name}을 삭제할까요?`)) deleteGym(gym.id) }}
                        className="text-xs font-medium"
                        style={{ color: '#D3D1C7' }}
                      >삭제</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 하단 액션 버튼 */}
          <div className="flex gap-3 pt-1">
            <button onClick={() => setMode('addBrand')} className="btn-secondary flex-1 text-sm">
              + 브랜드 추가
            </button>
            <button onClick={() => setMode('addCustomGym')} className="btn-secondary flex-1 text-sm">
              + 커스텀 암장
            </button>
          </div>
        </div>
      )}
    </PageShell>
  )
}
