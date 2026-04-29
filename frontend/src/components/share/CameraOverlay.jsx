import { useEffect, useRef, useState, useCallback } from 'react'
import { X, RefreshCw } from 'lucide-react'

function isLight(hex) {
  if (!hex || hex.length < 7) return true
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return r * 0.299 + g * 0.587 + b * 0.114 > 180
}

async function saveImage(blob, date) {
  const file = new File([blob], `벽로그_${date}.png`, { type: 'image/png' })
  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: '벽로그' })
      return
    } catch (e) {
      if (e.name === 'AbortError') return
    }
  }
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = file.name
  a.click()
  URL.revokeObjectURL(url)
}

export default function CameraOverlay({ gymGroups, todayVisits = [], userName = '나', onClose }) {
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
        video: {
          facingMode: mode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
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

      const vw = video.videoWidth || W
      const vh = video.videoHeight || H

      // 화면 비율에 맞게 video 해상도 기준으로 캔버스 크기 결정 (최대 해상도 활용)
      const aspect = W / H
      let cw, ch
      if (vw / vh > aspect) {
        ch = vh
        cw = Math.round(vh * aspect)
      } else {
        cw = vw
        ch = Math.round(vw / aspect)
      }

      const canvas = document.createElement('canvas')
      canvas.width = cw
      canvas.height = ch
      const ctx = canvas.getContext('2d')

      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // 비디오 → 캔버스 매핑 (cover 방식, 중앙 크롭)
      const srcScale = Math.max(cw / vw, ch / vh)
      const srcW = cw / srcScale
      const srcH = ch / srcScale
      const srcX = (vw - srcW) / 2
      const srcY = (vh - srcH) / 2

      if (facingMode === 'user') {
        ctx.save()
        ctx.translate(canvas.width, 0)
        ctx.scale(-1, 1)
        ctx.drawImage(video, srcX, srcY, srcW, srcH, 0, 0, cw, ch)
        ctx.restore()
      } else {
        ctx.drawImage(video, srcX, srcY, srcW, srcH, 0, 0, cw, ch)
      }

      // 카드 위치: 화면 좌표 → 캔버스 좌표로 변환
      const scaleX = cw / W
      const scaleY = ch / H

      const cardEl = overlayCardRef.current
      const cardRect = cardEl.getBoundingClientRect()
      const { default: html2canvas } = await import('html2canvas')
      await document.fonts.ready
      const cardCanvas = await html2canvas(cardEl, {
        scale: Math.max(scaleX, scaleY) * 2,
        backgroundColor: null,
        useCORS: true,
        logging: false,
      })

      ctx.drawImage(
        cardCanvas,
        cardRect.left * scaleX, cardRect.top * scaleY,
        cardRect.width * scaleX, cardRect.height * scaleY,
      )

      canvas.toBlob(async (blob) => {
        await saveImage(blob, todayStr)
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
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2 }}>TODAY</p>
          <p style={{ color: '#fff', fontSize: 15, fontWeight: 700, letterSpacing: -0.3 }}>{todayLabel}</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={handleFlip}
            disabled={flipping}
            style={{
              width: 42, height: 42, borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
              color: '#fff', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'transform 0.3s',
              transform: flipping ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          >
            <RefreshCw size={18} />
          </button>
          <button
            onClick={onClose}
            style={{
              width: 42, height: 42, borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
              color: '#fff', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* 우하단: 오버레이 카드 (작은 모서리 카드) */}
      <div
        ref={overlayCardRef}
        style={{
          position: 'absolute', bottom: 110, right: 20, zIndex: 10,
          width: 180,
        }}
      >
        <div style={{
          background: 'rgba(255,255,255,0.93)',
          border: '1px solid rgba(255,255,255,0.9)',
          borderRadius: 16,
          padding: '12px 14px 10px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
        }}>
          {/* 헤더 */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: 8, paddingBottom: 8,
            borderBottom: '0.5px solid rgba(0,0,0,0.08)',
          }}>
            <span style={{ fontWeight: 700, fontSize: 12, color: '#444441', letterSpacing: -0.3 }}>
              🧗 {userName}의 벽
            </span>
            <span style={{ fontWeight: 700, fontSize: 18, color: '#B5607E', lineHeight: 1 }}>
              {totalCount}<span style={{ fontSize: 10, fontWeight: 500, color: '#888780', marginLeft: 2 }}>개</span>
            </span>
          </div>

          {/* 날짜 */}
          <p style={{ fontSize: 10, color: '#888780', fontWeight: 500, marginBottom: 8 }}>{todayLabel}</p>

          {/* 암장별 색상 */}
          {gymGroups.map((gym, i) => (
            <div key={gym.gymName} style={{ marginBottom: i < gymGroups.length - 1 ? 8 : 0 }}>
              <p style={{ fontSize: 9, fontWeight: 500, color: '#B5607E', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 6 }}>
                {gym.gymName}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {gym.colors.map((c) => (
                  <div key={c.level} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      backgroundColor: c.hex,
                      border: '1px solid rgba(0,0,0,0.08)',
                      textAlign: 'center',
                      lineHeight: '28px',
                      fontSize: 11, fontWeight: 700,
                      color: isLight(c.hex) ? '#444441' : '#fff',
                    }}>{c.count}</div>
                    <span style={{ fontSize: 8, color: '#888780', fontWeight: 500 }}>{c.label}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 하단 셔터 버튼 */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10,
        paddingBottom: 36,
        display: 'flex', justifyContent: 'center',
        background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 100%)',
      }}>
        <button
          onClick={handleCapture}
          disabled={capturing || !!error}
          style={{
            width: 68, height: 68, borderRadius: '50%',
            background: capturing ? 'rgba(255,255,255,0.35)' : '#fff',
            border: '4px solid rgba(255,255,255,0.45)',
            cursor: capturing ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            transition: 'transform 0.1s, background 0.15s',
            transform: capturing ? 'scale(0.92)' : 'scale(1)',
          }}
        >
          {capturing && (
            <div style={{
              width: 26, height: 26, borderRadius: '50%',
              border: '3px solid #D88CA6',
              borderTopColor: 'transparent',
              animation: 'spin 0.8s linear infinite',
            }} />
          )}
        </button>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
