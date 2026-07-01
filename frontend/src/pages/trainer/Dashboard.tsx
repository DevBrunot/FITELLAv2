import { useQuery } from '@tanstack/react-query'
import { Users, ClipboardList, CheckCircle, Clock, Star } from 'lucide-react'
import { dashboardApi } from '@/api/dashboard'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { PageSpinner } from '@/components/ui/Spinner'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const EFFORT_MAP = { easy: 'Fácil', moderate: 'Moderado', hard: 'Difícil' } as const

export function Dashboard() {
  const { data: metrics, isLoading: loadingMetrics } = useQuery({
    queryKey: ['dashboard', 'metrics'],
    queryFn: dashboardApi.getMetrics,
  })
  const { data: feedbacks, isLoading: loadingFeedbacks } = useQuery({
    queryKey: ['dashboard', 'feedbacks'],
    queryFn: dashboardApi.getRecentFeedbacks,
  })

  if (loadingMetrics || loadingFeedbacks) return <PageSpinner />

  const cards = [
    { label: 'Total de alunas', value: metrics?.totalStudents ?? 0, icon: Users, color: 'text-primary-600 bg-primary-50' },
    { label: 'Pendentes', value: metrics?.pendingStudents ?? 0, icon: Clock, color: 'text-yellow-600 bg-yellow-50' },
    { label: 'Ativas', value: metrics?.approvedStudents ?? 0, icon: CheckCircle, color: 'text-green-600 bg-green-50' },
    { label: 'Treinos criados', value: metrics?.totalWorkouts ?? 0, icon: ClipboardList, color: 'text-blue-600 bg-blue-50' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Visão geral do seu negócio</p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} padding="md">
            <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${color} mb-3`}>
              <Icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{label}</p>
          </Card>
        ))}
      </div>

      {/* Completions stat */}
      <Card padding="md" className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
          <CheckCircle className="h-6 w-6" />
        </div>
        <div>
          <p className="text-3xl font-bold text-gray-900">{metrics?.completedExecutions ?? 0}</p>
          <p className="text-sm text-gray-500">treinos concluídos por alunas</p>
        </div>
      </Card>

      {/* Recent feedbacks */}
      <div>
        <h2 className="section-title mb-4">Feedbacks recentes</h2>
        {!feedbacks?.length ? (
          <Card padding="md" className="text-center text-gray-400 py-10">
            Nenhum feedback ainda.
          </Card>
        ) : (
          <div className="space-y-3">
            {feedbacks.map((fb) => (
              <Card key={fb.id} padding="md" className="flex gap-4">
                {/* Rating stars */}
                <div className="shrink-0 flex flex-col items-center gap-1">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`h-4 w-4 ${s <= fb.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-400">{fb.rating}/5</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-medium text-sm text-gray-900">{fb.student?.name ?? 'Aluna'}</span>
                    {fb.effort && (
                      <Badge variant={fb.effort === 'hard' ? 'danger' : fb.effort === 'moderate' ? 'warning' : 'success'}>
                        {EFFORT_MAP[fb.effort as keyof typeof EFFORT_MAP]}
                      </Badge>
                    )}
                  </div>
                  {fb.comment && <p className="text-sm text-gray-600 truncate">{fb.comment}</p>}
                  {fb.painOrDiscomfort && (
                    <p className="text-xs text-red-500 mt-0.5">⚠ {fb.painOrDiscomfort}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
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
