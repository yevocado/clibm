import { useEffect, useRef, useState, useCallback } from 'react'
import { X, RefreshCw } from 'lucide-react'

function isLight(hex) {
  if (!hex || hex.length < 7) return true
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return r * 0.299 + g * 0.587 + b * 0.114 > 180
}

function fallbackDownload(blob, date) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `유리의벽_${date}.png`
  a.click()
  URL.revokeObjectURL(url)
}

export default function CameraOverlay({ gymGroups, todayVisits = [], onClose }) {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const overlayCardRef = useRef(null)
  const [facingMode, setFacingMode] = useState('environment')
  const [error, setError] = useState(null)
  const [flipping, setFlipping] = useState(false)
  const [capturing, setCapturing] = useState(false)

  const totalCount = gymGroups.reduce(
    (sum, g) => sum + g.colors.reduce((s, c) => s + c.count, 0),
    0
  )

  const todayLabel = new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })
  const todayStr = new Date().toISOString().slice(0, 10)

  const startCamera = useCallback(async (mode) => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
    } catch {
      setError('카메라를 사용할 수 없어요.\n권한을 허용해 주세요.')
    }
  }, [])

  useEffect(() => {
    startCamera(facingMode)
    return () => streamRef.current?.getTracks().forEach((t) => t.stop())
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleFlip = async () => {
    if (flipping) return
    setFlipping(true)
    const next = facingMode === 'environment' ? 'user' : 'environment'
    setFacingMode(next)
    await startCamera(next)
    setFlipping(false)
  }

  const handleCapture = async () => {
    if (capturing || !videoRef.current || !overlayCardRef.current) return
    setCapturing(true)

    try {
      const video = videoRef.current
      const W = window.innerWidth
      const H = window.innerHeight
      const DPR = window.devicePixelRatio || 1

      // 1. 비디오 프레임 → 캔버스
      const canvas = document.createElement('canvas')
      canvas.width = W * DPR
      canvas.height = H * DPR
      const ctx = canvas.getContext('2d')

      const vw = video.videoWidth || W
      const vh = video.videoHeight || H
      const scale = Math.max(W / vw, H / vh)
      const sw = vw * scale
      const sh = vh * scale
      const ox = (W - sw) / 2
      const oy = (H - sh) / 2

      if (facingMode === 'user') {
        ctx.translate(canvas.width, 0)
        ctx.scale(-1, 1)
        ctx.drawImage(video, ox * DPR, oy * DPR, sw * DPR, sh * DPR)
        ctx.setTransform(1, 0, 0, 1, 0, 0)
      } else {
        ctx.drawImage(video, ox * DPR, oy * DPR, sw * DPR, sh * DPR)
      }

      // 2. 오버레이 카드 → canvas로 합성
      const cardEl = overlayCardRef.current
      const cardRect = cardEl.getBoundingClientRect()

      // html2canvas는 backdrop-filter 미지원 → 카드 배경을 solid로 덮어서 캡처
      const { default: html2canvas } = await import('html2canvas')
      const cardCanvas = await html2canvas(cardEl, {
        scale: DPR * 2,
        backgroundColor: 'rgba(10,10,10,0.85)',
        useCORS: true,
        logging: false,
      })

      ctx.drawImage(
        cardCanvas,
        cardRect.left * DPR,
        cardRect.top * DPR,
        cardRect.width * DPR,
        cardRect.height * DPR,
      )

      // 3. 저장
      canvas.toBlob(async (blob) => {
        const file = new File([blob], `유리의벽_${todayStr}.png`, { type: 'image/png' })
        if (navigator.canShare?.({ files: [file] })) {
          try {
            await navigator.share({ files: [file], title: '유리의 벽 — 오늘의 완등' })
          } catch (e) {
            if (e.name !== 'AbortError') fallbackDownload(blob, todayStr)
          }
        } else {
          fallbackDownload(blob, todayStr)
        }
        setCapturing(false)
      }, 'image/png')
    } catch (e) {
      console.error('capture error:', e)
      setCapturing(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#000' }}>
      {/* 카메라 피드 */}
      {error ? (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          color: '#fff', padding: 32, textAlign: 'center', gap: 16,
        }}>
          <span style={{ fontSize: 40 }}>📷</span>
          <p style={{ fontSize: 15, lineHeight: 1.6, whiteSpace: 'pre-line', color: 'rgba(255,255,255,0.8)' }}>
            {error}
          </p>
        </div>
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%', objectFit: 'cover',
            transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
            opacity: flipping ? 0 : 1,
            transition: 'opacity 0.2s',
          }}
        />
      )}

      {/* 상단 컨트롤 */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
        padding: '52px 20px 20px',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, transparent 100%)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, fontWeight: 600, letterSpacing: 0.5, marginBottom: 2 }}>TODAY</p>
          <p style={{ color: '#fff', fontSize: 15, fontWeight: 800, letterSpacing: -0.3 }}>{todayLabel}</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={handleFlip} disabled={flipping} style={{
            width: 42, height: 42, borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
            color: '#fff', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'transform 0.3s',
            transform: flipping ? 'rotate(180deg)' : 'rotate(0deg)',
          }}>
            <RefreshCw size={18} />
          </button>
          <button onClick={onClose} style={{
            width: 42, height: 42, borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
            color: '#fff', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <X size={20} />
          </button>
        </div>
      </div>

      {/* 하단: 오버레이 카드 + 셔터 */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10,
        background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 100%)',
        paddingBottom: 32,
      }}>
        {/* 오버레이 카드 */}
        <div ref={overlayCardRef} style={{ margin: '0 20px 24px' }}>
          <div style={{
            background: 'rgba(8, 8, 8, 0.6)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.18)',
            borderRadius: 24,
            padding: '18px 20px 16px',
            color: '#fff',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}>
            {/* 헤더 */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginBottom: 14, paddingBottom: 14,
              borderBottom: '1px solid rgba(255,255,255,0.1)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: 'linear-gradient(135deg, #E8366F, #FF6B9E)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                }}>🧗</div>
                <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: -0.3 }}>유리의 벽</span>
              </div>
              <div>
                <span style={{ fontWeight: 900, fontSize: 28, color: '#FF6B9E', lineHeight: 1 }}>{totalCount}</span>
                <span style={{ fontSize: 13, fontWeight: 600, marginLeft: 3, color: 'rgba(255,255,255,0.5)' }}>개</span>
              </div>
            </div>

            {/* 오늘 방문 */}
            {todayVisits.length > 0 && (
              <div style={{
                marginBottom: gymGroups.length > 0 ? 14 : 0,
                paddingBottom: gymGroups.length > 0 ? 14 : 0,
                borderBottom: gymGroups.length > 0 ? '1px solid rgba(255,255,255,0.1)' : 'none',
              }}>
                <p style={{ fontSize: 11, fontWeight: 700, marginBottom: 8, color: 'rgba(255,255,255,0.5)', letterSpacing: 0.3 }}>오늘 방문</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {todayVisits.map((v) => (
                    <span key={v.id} style={{
                      background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.22)',
                      borderRadius: 20, padding: '5px 13px', fontSize: 12, fontWeight: 700, color: '#fff',
                    }}>{v.gymName}</span>
                  ))}
                </div>
              </div>
            )}

            {/* 암장별 색상 */}
            {gymGroups.map((gym, i) => (
              <div key={gym.gymName} style={{ marginBottom: i < gymGroups.length - 1 ? 14 : 0 }}>
                <p style={{ fontSize: 11, fontWeight: 700, marginBottom: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: 0.3 }}>
                  {gym.gymName}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {gym.colors.map((c) => (
                    <div key={c.level} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: '50%',
                        backgroundColor: c.hex, border: '2px solid rgba(255,255,255,0.5)',
                        boxShadow: `0 2px 12px ${c.hex}66`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 14, fontWeight: 900,
                        color: isLight(c.hex) ? '#1A1A1A' : '#fff',
                      }}>{c.count}</div>
                      <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>{c.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 셔터 버튼 */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={handleCapture}
            disabled={capturing || !!error}
            style={{
              width: 70, height: 70, borderRadius: '50%',
              background: capturing ? 'rgba(255,255,255,0.4)' : '#fff',
              border: '4px solid rgba(255,255,255,0.5)',
              cursor: capturing ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(0,0,0,0.35)',
              transition: 'transform 0.1s, background 0.15s',
              transform: capturing ? 'scale(0.92)' : 'scale(1)',
            }}
          >
            {capturing && (
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                border: '3px solid #E8366F',
                borderTopColor: 'transparent',
                animation: 'spin 0.8s linear infinite',
              }} />
            )}
          </button>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
