import { Link, useLocation } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { Home, MapPin, TrendingUp, Settings } from 'lucide-react'
import { auth } from '../../firebase'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { to: '/dashboard', label: '홈',   Icon: Home },
  { to: '/routes',    label: '방문',  Icon: MapPin },
  { to: '/progress',  label: '성장',  Icon: TrendingUp },
]

export default function Navbar() {
  const location = useLocation()
  const { user } = useAuth()

  const handleLogout = () => signOut(auth)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white" style={{ boxShadow: '0 1px 0 #EBEBEB' }}>
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* 로고 */}
        <Link to="/dashboard" className="font-black text-base tracking-tight shrink-0" style={{ color: '#0F0F0F', letterSpacing: '-0.5px' }}>
          유리의 벽
        </Link>

        {/* 탭 */}
        <nav className="flex items-center gap-0.5 flex-1 justify-center">
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
                <span className="hidden sm:inline">{label}</span>
              </Link>
            )
          })}
        </nav>

        {/* 우측 */}
        <div className="flex items-center gap-1 shrink-0">
          <Link
            to="/gyms"
            className="p-2 rounded-btn transition-colors"
            style={{ color: location.pathname.startsWith('/gyms') ? '#E8366F' : '#888888' }}
          >
            <Settings size={19} />
          </Link>
          {user && (
            <button onClick={handleLogout} className="btn-ghost text-xs px-2 py-1">
              로그아웃
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
