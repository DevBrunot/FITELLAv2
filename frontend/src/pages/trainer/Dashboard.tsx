import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Users, ClipboardList, CheckCircle, Clock, Star, ChevronRight } from 'lucide-react'
import { dashboardApi } from '@/api/dashboard'
import { studentsApi } from '@/api/students'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { PageSpinner } from '@/components/ui/Spinner'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useAuth } from '@/contexts/AuthContext'

const EFFORT_MAP = { easy: 'Fácil', moderate: 'Moderado', hard: 'Difícil' } as const

export function Dashboard() {
  const { user } = useAuth()

  const { data: metrics, isLoading: loadingMetrics } = useQuery({
    queryKey: ['dashboard', 'metrics'],
    queryFn: dashboardApi.getMetrics,
  })
  const { data: feedbacks, isLoading: loadingFeedbacks } = useQuery({
    queryKey: ['dashboard', 'feedbacks'],
    queryFn: dashboardApi.getRecentFeedbacks,
  })
  const { data: studentsData, isLoading: loadingStudents } = useQuery({
    queryKey: ['students-pending-dashboard'],
    queryFn: () => studentsApi.list(1, 20),
  })

  if (loadingMetrics || loadingFeedbacks || loadingStudents) return <PageSpinner />

  const pendingStudents = (studentsData?.data ?? []).filter((s) => s.status === 'pending')
  const userName = user?.email?.split('@')[0] ?? 'Personal'
  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  const initials = (name: string) =>
    name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()

  const quickActions = [
    { title: 'Alunas', href: '/trainer/students', icon: Users },
    { title: 'Treinos', href: '/trainer/workouts', icon: ClipboardList },
    { title: 'Exercícios', href: '/trainer/exercises', icon: CheckCircle },
    { title: 'Links', href: '/trainer/links', icon: ChevronRight },
  ]

  const statCards = [
    { label: 'Total de alunas', value: metrics?.totalStudents ?? 0, icon: Users, color: 'bg-accent text-primary' },
    { label: 'Pendentes', value: metrics?.pendingStudents ?? 0, icon: Clock, color: 'bg-accent text-accent-foreground' },
    { label: 'Ativas', value: metrics?.approvedStudents ?? 0, icon: CheckCircle, color: 'bg-secondary/15 text-secondary' },
    { label: 'Treinos criados', value: metrics?.totalWorkouts ?? 0, icon: ClipboardList, color: 'bg-accent text-primary' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow mb-1.5">Personal</p>
        <h1 className="page-title">Olá, {userName}</h1>
        <p className="text-sm capitalize text-muted-foreground mt-1">{today}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} padding="md" className="border-border shadow-sm">
            <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${color} mb-3`}>
              <Icon className="h-5 w-5" strokeWidth={1.5} />
            </div>
            <p className="text-2xl font-semibold text-foreground">{value}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
          </Card>
        ))}
      </div>

      <Card padding="md" className="border-border shadow-sm">
        <div className="mb-3.5 flex items-center justify-between">
          <span className="text-sm font-semibold">Alunas pendentes</span>
          {pendingStudents.length > 0 && (
            <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">
              {pendingStudents.length} nova{pendingStudents.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
        {pendingStudents.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">Nenhuma aluna pendente</p>
        ) : (
          <ul className="divide-y divide-border">
            {pendingStudents.map((s) => (
              <li key={s.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-secondary/15 text-sm font-semibold text-secondary">
                  {initials(s.name)}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm">{s.name}</p>
                  <p className="text-xs text-muted-foreground">aguardando aprovação</p>
                </div>
                <Link to="/trainer/students" className="text-sm text-primary hover:opacity-70">
                  Ver
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div>
        <p className="eyebrow mb-3 !text-muted-foreground">Acesso rápido</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map((a) => (
            <Link
              key={a.title}
              to={a.href}
              className="group flex flex-col items-start gap-3 rounded-2xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent">
                <a.icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
              </span>
              <span className="flex w-full items-center justify-between text-sm font-semibold">
                {a.title}
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" strokeWidth={1.5} />
              </span>
            </Link>
          ))}
        </div>
      </div>

      <Card padding="md" className="flex items-center gap-4 border-border shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/15 text-secondary">
          <CheckCircle className="h-6 w-6" strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-3xl font-semibold text-foreground">{metrics?.completedExecutions ?? 0}</p>
          <p className="text-sm text-muted-foreground">treinos concluídos por alunas</p>
        </div>
      </Card>

      <div>
        <h2 className="section-title mb-4">Feedbacks recentes</h2>
        {!feedbacks?.length ? (
          <Card padding="md" className="text-center text-muted-foreground py-10">
            Nenhum feedback ainda.
          </Card>
        ) : (
          <div className="space-y-3">
            {feedbacks.map((fb) => (
              <Card key={fb.id} padding="md" className="flex gap-4 border-border shadow-sm">
                <div className="shrink-0 flex flex-col items-center gap-1">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`h-4 w-4 ${s <= fb.rating ? 'text-primary fill-primary' : 'text-muted fill-muted'}`}
                        strokeWidth={1.5}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">{fb.rating}/5</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-medium text-sm text-foreground">{fb.student?.name ?? 'Aluna'}</span>
                    {fb.effort && (
                      <Badge variant={fb.effort === 'hard' ? 'danger' : fb.effort === 'moderate' ? 'warning' : 'success'}>
                        {EFFORT_MAP[fb.effort as keyof typeof EFFORT_MAP]}
                      </Badge>
                    )}
                  </div>
                  {fb.comment && <p className="text-sm text-muted-foreground truncate">{fb.comment}</p>}
                  {fb.painOrDiscomfort && (
                    <p className="text-xs text-destructive mt-0.5">{fb.painOrDiscomfort}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {fb.workout?.title} · {format(new Date(fb.createdAt), "d 'de' MMM", { locale: ptBR })}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
