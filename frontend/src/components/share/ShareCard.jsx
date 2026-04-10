import { forwardRef } from 'react'

// html2canvas로 캡처할 카드 — 화면에 안 보이게 오프스크린에 렌더링됨
const ShareCard = forwardRef(function ShareCard({ date, gymGroups, todayVisits = [] }, ref) {
  const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  })

  const totalCount = gymGroups.reduce(
    (sum, g) => sum + g.colors.reduce((s, c) => s + c.count, 0),
    0
  )

  return (
    <div
      ref={ref}
      style={{
        width: 400,
        fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif",
        background: '#fff',
        borderRadius: 24,
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(232,54,111,0.18)',
      }}
    >
      {/* 헤더 */}
      <div
        style={{
          background: 'linear-gradient(135deg, #E8366F 0%, #C4234F 100%)',
          padding: '28px 28px 24px',
          color: '#fff',
        }}
      >
        <p style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>🧗 유리의 벽</p>
        <p style={{ fontSize: 14, opacity: 0.85 }}>{formattedDate}</p>
      </div>

      {/* 바디 */}
      <div style={{ padding: '24px 28px' }}>

        {/* 오늘 방문 */}
        {todayVisits.length > 0 && (
          <div style={{ marginBottom: gymGroups.length > 0 ? 20 : 0 }}>
            <p style={{
              fontSize: 11, fontWeight: 700, color: '#BBBBBB',
              letterSpacing: 0.5, marginBottom: 10, textTransform: 'uppercase',
            }}>
              오늘 방문
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {todayVisits.map((v) => (
                <span key={v.id} style={{
                  background: '#FFF0F4',
                  border: '1px solid #F0E0E5',
                  borderRadius: 20,
                  padding: '5px 13px',
                  fontSize: 12, fontWeight: 700, color: '#E8366F',
                }}>
                  {v.gymName}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 암장별 완등 */}
        {gymGroups.map((gym) => {
          const gymTotal = gym.colors.reduce((s, c) => s + c.count, 0)
          return (
            <div key={gym.gymName} style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <p style={{ fontSize: 20, fontWeight: 800, color: '#1A1A1A' }}>{gym.gymName}</p>
                <p style={{ fontSize: 13, color: '#E8366F', fontWeight: 700 }}>{gymTotal}개</p>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
                {gym.colors.map((c) => (
                  <div key={c.level} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                    <div
                      style={{
                        width: 44, height: 44, borderRadius: '50%',
                        backgroundColor: c.hex,
                        border: '2px solid #F0E0E5',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 16, fontWeight: 800,
                        color: isLight(c.hex) ? '#1A1A1A' : '#fff',
                      }}
                    >
                      {c.count}
                    </div>
                    <span style={{ fontSize: 10, color: '#999', fontWeight: 500 }}>{c.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        {/* 총 완등 */}
        {gymGroups.length > 0 && (
          <>
            <div style={{ height: 1, background: '#F0E0E5', margin: '4px 0 16px' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ fontSize: 15, color: '#666', fontWeight: 500 }}>총 완등</p>
              <p style={{ fontSize: 28, fontWeight: 900, color: '#E8366F' }}>
                {totalCount}
                <span style={{ fontSize: 14, fontWeight: 600, marginLeft: 3, color: '#999' }}>개</span>
              </p>
            </div>
          </>
        )}
      </div>

      {/* 푸터 */}
      <div style={{ background: '#FAFAFA', padding: '12px 28px', borderTop: '1px solid #F0E0E5' }}>
        <p style={{ fontSize: 11, color: '#BBBBBB', textAlign: 'center' }}>유리의 벽으로 기록하세요 🏔️</p>
      </div>
    </div>
  )
})

function isLight(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return r * 0.299 + g * 0.587 + b * 0.114 > 180
}

export default ShareCard
