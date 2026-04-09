import { Link, useLocation } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { Home, Mountain, MapPin, TrendingUp, Settings } from 'lucide-react'
import { auth } from '../../firebase'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { to: '/dashboard', label: '홈',   Icon: Home },
  { to: '/routes',    label: '루트',  Icon: Mountain },
  { to: '/visits',    label: '방문',  Icon: MapPin },
  { to: '/progress',  label: '성장',  Icon: TrendingUp },
]

export default function Navbar() {
  const location = useLocation()
  const { user } = useAuth()

  const handleLogout = () => signOut(auth)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b" style={{ borderColor: '#F0E0E5' }}>
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* 로고 */}
        <Link to="/dashboard" className="font-bold text-lg tracking-tight shrink-0" style={{ color: '#E8366F' }}>
          🧗 유리의 벽
        </Link>

        {/* 탭 */}
        <nav className="flex items-center gap-1 flex-1 justify-center">
          {navItems.map(({ to, label, Icon }) => {
            const active = location.pathname.startsWith(to)
            return (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-btn text-sm font-semibold transition-colors"
                style={{
                  color: active ? '#E8366F' : '#666666',
                  background: active ? '#FFF0F4' : 'transparent',
                }}
              >
                <Icon size={16} />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            )
          })}
        </nav>

        {/* 우측 아이콘들 */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/gyms"
            className="p-2 rounded-btn transition-colors"
            style={{ color: location.pathname.startsWith('/gyms') ? '#E8366F' : '#666666' }}
          >
            <Settings size={20} />
          </Link>
          {user && (
            <button onClick={handleLogout} className="btn-ghost text-sm">
              로그아웃
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
