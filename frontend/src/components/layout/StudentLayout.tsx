import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { ClipboardList, FileText, Bell, LogOut, Heart, Menu, X } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/utils/cn'
import { useQuery } from '@tanstack/react-query'
import { notificationsApi } from '@/api/notifications'

const navItems = [
  { to: '/student/workouts', icon: ClipboardList, label: 'Meus Treinos', shortLabel: 'Treinos' },
  { to: '/student/anamnesis', icon: FileText, label: 'Anamnese', shortLabel: 'Anamnese' },
  { to: '/student/notifications', icon: Bell, label: 'Notificações', shortLabel: 'Avisos' },
]

export function StudentLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const { data: notifData } = useQuery({
    queryKey: ['notifications', 1],
    queryFn: () => notificationsApi.list(1, 50),
    refetchInterval: 30_000,
  })
  const unreadCount = notifData?.data.filter((n) => !n.isRead).length ?? 0

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const sidebar = (
    <>
      <div className="flex items-center justify-between gap-2.5 px-5 py-4 border-b border-border lg:px-6 lg:py-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
            <Heart className="h-5 w-5 text-primary-foreground fill-primary-foreground" strokeWidth={1.5} />
          </div>
          <span className="font-display text-xl text-foreground">Fitela</span>
        </div>
        <button
          type="button"
          onClick={() => setMenuOpen(false)}
          className="rounded-lg p-2 text-muted-foreground hover:bg-muted lg:hidden"
          aria-label="Fechar menu"
        >
          <X className="h-5 w-5" strokeWidth={1.5} />
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )
            }
          >
            <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.5} />
            <span>{label}</span>
            {label === 'Notificações' && unreadCount > 0 && (
              <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border p-3">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground font-semibold text-sm">
            {user?.email.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{user?.email}</p>
            <p className="text-xs text-muted-foreground">Aluna</p>
          </div>
          <button
            onClick={handleLogout}
            className="shrink-0 rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            title="Sair"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </>
  )

  return (
    <div className="flex min-h-screen bg-background">
      {menuOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-[2px] lg:hidden"
          aria-label="Fechar menu"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[min(18rem,85vw)] flex-col border-r border-border bg-card shadow-sm transition-transform duration-200 lg:static lg:z-0 lg:w-64 lg:translate-x-0',
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {sidebar}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col pb-20 lg:pb-0">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-card/95 px-4 py-3 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="rounded-lg p-2 text-foreground hover:bg-muted"
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" strokeWidth={1.5} />
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
              <Heart className="h-4 w-4 text-primary-foreground fill-primary-foreground" strokeWidth={1.5} />
            </div>
            <span className="font-display text-lg text-foreground truncate">Fitela</span>
          </div>
          {unreadCount > 0 && (
            <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </header>

        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="mx-auto max-w-4xl px-4 py-5 sm:px-6 sm:py-8">
            <Outlet />
          </div>
        </main>

        <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 backdrop-blur lg:hidden safe-bottom">
          <div className="mx-auto flex max-w-4xl items-stretch justify-around px-2 py-1.5">
            {navItems.map(({ to, icon: Icon, shortLabel, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    'relative flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-medium transition-colors',
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )
                }
              >
                <Icon className="h-5 w-5" strokeWidth={1.5} />
                <span className="truncate">{shortLabel}</span>
                {label === 'Notificações' && unreadCount > 0 && (
                  <span className="absolute right-1/2 top-1 translate-x-4 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </div>
  )
}
