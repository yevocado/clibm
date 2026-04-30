import { forwardRef } from 'react'

function isLight(hex) {
  if (!hex || hex.length < 7) return true
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return r * 0.299 + g * 0.587 + b * 0.114 > 180
}

const ShareCard = forwardRef(function ShareCard({ date, gymGroups, todayVisits = [], userName = '나' }, ref) {
  const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'short',
  })

  const totalCount = gymGroups.reduce(
    (sum, g) => sum + g.colors.reduce((s, c) => s + c.count, 0),
    0
  )

  return (
    <div
      ref={ref}
      style={{
        width: 360,
        fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif",
        background: '#fff',
        borderRadius: 20,
        overflow: 'hidden',
        border: '0.5px solid var(--color-primary-border)',
      }}
    >
      {/* 헤더 */}
      <div style={{
        background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-gradient-end) 100%)',
        padding: '20px 24px 16px',
        color: '#fff',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <span style={{ fontSize: 13 }}>🧗</span>
              <span style={{ fontSize: 12, fontWeight: 600, opacity: 0.85, letterSpacing: '0.04em' }}>
                {userName}의 벽
              </span>
            </div>
            <p style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.4, lineHeight: 1.2 }}>
              {formattedDate}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 30, fontWeight: 700, lineHeight: 1 }}>{totalCount}</p>
            <p style={{ fontSize: 11, fontWeight: 500, opacity: 0.7, marginTop: 2 }}>총 완등</p>
          </div>
        </div>

        {todayVisits.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 10 }}>
            {todayVisits.map((v) => (
              <span key={v.id} style={{
                background: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: 20, padding: '2px 10px',
                fontSize: 11, fontWeight: 600,
              }}>
                {v.gymName}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 암장별 완등 — 컴팩트 */}
      {gymGroups.length > 0 && (
        <div style={{ padding: '14px 24px' }}>
          {gymGroups.map((gym, i) => {
            const gymTotal = gym.colors.reduce((s, c) => s + c.count, 0)
            return (
              <div
                key={gym.gymName}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  paddingBottom: i < gymGroups.length - 1 ? 10 : 0,
                  marginBottom: i < gymGroups.length - 1 ? 10 : 0,
                  borderBottom: i < gymGroups.length - 1 ? '0.5px solid var(--color-primary-border)' : 'none',
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 600, color: '#444441', minWidth: 60, flexShrink: 0 }}>
                  {gym.gymName}
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, flex: 1 }}>
                  {gym.colors.map((c) => (
                    <div key={c.level} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <div style={{
                        width: 12, height: 12, borderRadius: '50%',
                        backgroundColor: c.hex, border: '0.5px solid var(--color-primary-border)', flexShrink: 0,
                      }} />
                      <span style={{ fontSize: 12, color: '#444441', fontWeight: 500 }}>{c.count}</span>
                    </div>
                  ))}
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 600, color: 'var(--color-primary-dark)',
                  background: 'var(--color-primary-light)', borderRadius: 4, padding: '2px 8px', flexShrink: 0,
                }}>
                  {gymTotal}개
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* 푸터 */}
      <div style={{ background: '#F5F3F0', padding: '8px 24px', borderTop: '0.5px solid var(--color-primary-border)' }}>
        <p style={{ fontSize: 10, color: '#D3D1C7', textAlign: 'center', fontWeight: 500 }}>벽로그로 기록하세요 🏔️</p>
      </div>
    </div>
  )
})

export default ShareCard
