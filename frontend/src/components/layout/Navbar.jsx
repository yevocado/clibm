import { Link, useLocation } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { Home, MapPin, TrendingUp, Settings } from 'lucide-react'
import { auth } from '../../firebase'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { to: '/dashboard', label: '홈',      Icon: Home },
  { to: '/routes',    label: '방문',    Icon: MapPin },
  { to: '/progress',  label: '성장',    Icon: TrendingUp },
  { to: '/gyms',      label: '암장',    Icon: Settings },
]

export default function Navbar() {
  const location = useLocation()
  const { user } = useAuth()

  const handleLogout = () => signOut(auth)

  return (
    <>
      {/* 상단 바 */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white" style={{ boxShadow: '0 1px 0 #EBEBEB' }}>
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/dashboard" className="font-black text-base tracking-tight" style={{ color: '#0F0F0F', letterSpacing: '-0.5px' }}>
            유리의 벽
          </Link>

          {/* 데스크탑 탭 (sm 이상) */}
          <nav className="hidden sm:flex items-center gap-0.5">
            {navItems.map(({ to, label, Icon }) => {
              const active = location.pathname.startsWith(to)
              return (
                <Link
                  key={to}
                  to={to}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-btn text-sm font-semibold transition-colors"
                  style={{
                    color: active ? '#E8366F' : '#888888',
                    background: active ? '#FBF0F3' : 'transparent',
                    fontWeight: active ? 700 : 500,
                  }}
                >
                  <Icon size={15} />
                  {label}
                </Link>
              )
            })}
          </nav>

          {user && (
            <button onClick={handleLogout} className="btn-ghost text-xs px-2 py-1">
              로그아웃
            </button>
          )}
        </div>
      </header>

      {/* 하단 탭 바 (모바일 전용) */}
      <nav
        className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white flex"
        style={{ boxShadow: '0 -1px 0 #EBEBEB' }}
      >
        {navItems.map(({ to, label, Icon }) => {
          const active = location.pathname.startsWith(to)
          return (
            <Link
              key={to}
              to={to}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 transition-colors"
              style={{ color: active ? '#E8366F' : '#AAAAAA' }}
            >
              <Icon size={22} />
              <span style={{ fontSize: 10, fontWeight: active ? 700 : 500 }}>{label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
