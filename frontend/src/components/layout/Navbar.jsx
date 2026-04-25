import { Link, useLocation } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { Home, MapPin, TrendingUp, Target, Settings } from 'lucide-react'
import { auth } from '../../firebase'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { to: '/dashboard', label: '홈',   Icon: Home },
  { to: '/routes',    label: '방문', Icon: MapPin },
  { to: '/progress',  label: '성장', Icon: TrendingUp },
  { to: '/goal',      label: '목표', Icon: Target },
  { to: '/gyms',      label: '암장', Icon: Settings },
]

export default function Navbar() {
  const location = useLocation()
  const { user } = useAuth()

  const handleLogout = () => signOut(auth)

  return (
    <>
      {/* 상단 바 */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white" style={{ borderBottom: '1px solid #EDD0DC' }}>
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/dashboard" className="font-bold text-base" style={{ color: '#444441', letterSpacing: '-0.3px' }}>
            유리의 벽
          </Link>

          {/* 데스크탑 탭 */}
          <nav className="hidden sm:flex items-center gap-0.5">
            {navItems.map(({ to, label, Icon }) => {
              const active = location.pathname.startsWith(to)
              return (
                <Link
                  key={to}
                  to={to}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-btn text-sm transition-colors"
                  style={{
                    color: active ? '#D88CA6' : '#888780',
                    background: active ? '#FBF0F4' : 'transparent',
                    fontWeight: active ? 600 : 500,
                  }}
                >
                  <Icon size={15} />
                  {label}
                </Link>
              )
            })}
          </nav>

          {user && (
            <button
              onClick={handleLogout}
              className="text-xs px-3 py-1.5 rounded-btn transition-colors"
              style={{ color: '#888780', fontWeight: 500 }}
              onMouseEnter={e => e.currentTarget.style.color = '#444441'}
              onMouseLeave={e => e.currentTarget.style.color = '#888780'}
            >
              로그아웃
            </button>
          )}
        </div>
      </header>

      {/* 하단 탭 바 (모바일) */}
      <nav
        className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white flex"
        style={{ borderTop: '1px solid #EDD0DC' }}
      >
        {navItems.map(({ to, label, Icon }) => {
          const active = location.pathname.startsWith(to)
          return (
            <Link
              key={to}
              to={to}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 transition-colors"
              style={{ color: active ? '#D88CA6' : '#D3D1C7' }}
            >
              <Icon size={22} />
              <span style={{ fontSize: 10, fontWeight: active ? 600 : 500 }}>{label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
