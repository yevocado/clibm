import { useState } from 'react'
import { signInWithRedirect, signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../firebase'

const FEATURES = [
  {
    emoji: '🎨',
    title: '색상으로 기록',
    desc: '암장별 색상 팔레트로 완등한 루트를 빠르게 기록해요.',
  },
  {
    emoji: '📈',
    title: '성장 추적',
    desc: '날짜별 최고 레벨과 완등 개수를 그래프로 한눈에 확인해요.',
  },
  {
    emoji: '🎯',
    title: '목표 설정',
    desc: '도전할 레벨을 목표로 설정하고 달성률을 추적해요.',
  },
  {
    emoji: '📷',
    title: '인증샷 촬영',
    desc: '오늘의 기록을 카메라 오버레이로 인증샷에 담아요.',
  },
]

const GoogleIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
)

export default function LoginPage() {
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleGoogleLogin = async () => {
    setError(null)
    setLoading(true)
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (err) {
      // 팝업 차단된 경우 리다이렉트로 폴백
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/popup-closed-by-user') {
        try {
          await signInWithRedirect(auth, googleProvider)
        } catch (e) {
          setError('로그인에 실패했어요. 다시 시도해주세요.')
          console.error(e)
        }
      } else {
        setError(`로그인에 실패했어요. (${err.code})`)
        console.error(err)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ background: '#F5F3F0', minHeight: '100svh' }}>
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 20px 60px' }}>

        {/* 히어로 */}
        <div style={{ textAlign: 'center', padding: '72px 0 48px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 80, height: 80, borderRadius: 24,
            background: 'linear-gradient(135deg, var(--color-primary-track), var(--color-primary))',
            fontSize: 36, marginBottom: 24,
            boxShadow: '0 8px 32px var(--color-primary-shadow)',
          }}>
            🧗
          </div>
          <h1 style={{
            fontSize: 40, fontWeight: 700, color: '#444441',
            letterSpacing: -1, lineHeight: 1.15, marginBottom: 12,
          }}>
            나의 벽을<br />기록해요
          </h1>
          <p style={{ fontSize: 16, color: '#888780', lineHeight: 1.6 }}>
            클라이밍 완등 기록부터 성장 추적까지<br />
            한 곳에서 관리하는 나만의 클라이밍 일지
          </p>
        </div>

        {/* 기능 소개 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 48 }}>
          {FEATURES.map((f) => (
            <div key={f.title} style={{
              background: '#fff',
              border: '0.5px solid #EDD0DC',
              borderRadius: 12,
              padding: '18px 16px',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'var(--color-primary-light)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, marginBottom: 10,
              }}>
                {f.emoji}
              </div>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#444441', marginBottom: 4 }}>
                {f.title}
              </p>
              <p style={{ fontSize: 12, color: '#888780', lineHeight: 1.55 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>

        {/* 로그인 */}
        <div style={{
          background: '#fff',
          border: '0.5px solid #EDD0DC',
          borderRadius: 16,
          padding: '28px 24px',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: 18, fontWeight: 700, color: '#444441', marginBottom: 4 }}>
            지금 시작해요
          </p>
          <p style={{ fontSize: 13, color: '#888780', marginBottom: 24 }}>
            Google 계정으로 간편하게 로그인
          </p>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="active:scale-95"
            style={{
              width: '100%',
              opacity: loading ? 0.7 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              height: 48, borderRadius: 10,
              border: '1px solid #EDD0DC',
              background: '#fff',
              color: '#444441',
              fontSize: 15, fontWeight: 500,
              cursor: 'pointer',
              transition: 'border-color 0.15s, background 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--color-primary)'
              e.currentTarget.style.background = 'var(--color-primary-light)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--color-primary-border)'
              e.currentTarget.style.background = '#fff'
            }}
          >
            <GoogleIcon />
            {loading ? '로그인 중…' : 'Google로 계속하기'}
          </button>

          {error && (
            <p style={{ fontSize: 12, color: '#ef4444', marginTop: 12 }}>{error}</p>
          )}

          <p style={{ fontSize: 11, color: '#D3D1C7', marginTop: 16 }}>
            로그인하면 기록이 클라우드에 안전하게 저장됩니다
          </p>
        </div>

        {/* 앱 이름 */}
        <p style={{ textAlign: 'center', fontSize: 12, color: '#D3D1C7', marginTop: 32 }}>
          🧗 벽로그
        </p>

      </div>
    </div>
  )
}
