import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Dumbbell,
  ClipboardList,
  Link2,
  Bell,
  LogOut,
  Heart,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/utils/cn'
import { useQuery } from '@tanstack/react-query'
import { notificationsApi } from '@/api/notifications'

const navItems = [
  { to: '/trainer/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/trainer/students', icon: Users, label: 'Alunas' },
  { to: '/trainer/exercises', icon: Dumbbell, label: 'Exercícios' },
  { to: '/trainer/workouts', icon: ClipboardList, label: 'Treinos' },
  { to: '/trainer/links', icon: Link2, label: 'Links de convite' },
  { to: '/trainer/notifications', icon: Bell, label: 'Notificações' },
]

export function TrainerLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const { data: notifData } = useQuery({
    queryKey: ['notifications', 1],
    queryFn: () => notificationsApi.list(1, 50),
    refetchInterval: 30_000,
  })
  const unreadCount = notifData?.data.filter((n) => !n.isRead).length ?? 0

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col shadow-sm">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-6 py-5 border-b border-gray-100">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600">
            <Heart className="h-5 w-5 text-white fill-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">Fitela</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-thin">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative',
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )
              }
            >
              <Icon className="h-4.5 w-4.5 h-[18px] w-[18px] shrink-0" />
              <span>{label}</span>
              {label === 'Notificações' && unreadCount > 0 && (
                <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-[10px] font-bold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="border-t border-gray-100 p-3">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700 font-semibold text-sm">
              {user?.email.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.email}</p>
              <p className="text-xs text-gray-500">Personal Trainer</p>
            </div>
            <button
              onClick={handleLogout}
              className="shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              title="Sair"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
