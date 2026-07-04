import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Dumbbell, Clock, ChevronRight, CheckCircle } from 'lucide-react'
import { studentWorkoutsApi } from '@/api/studentWorkouts'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { PageSpinner } from '@/components/ui/Spinner'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const TYPE_MAP: Record<string, string> = {
  gestational: 'Gestacional',
  post_partum: 'Pós-parto',
  general: 'Geral',
}

export function MyWorkouts() {
  const { data, isLoading } = useQuery({
    queryKey: ['student-workouts'],
    queryFn: () => studentWorkoutsApi.list(),
  })

  if (isLoading) return <PageSpinner />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Meus Treinos</h1>
        <p className="text-muted-foreground text-sm mt-1">Treinos enviados pelo seu personal</p>
      </div>

      {!data?.data.length ? (
        <Card padding="md" className="text-center py-16 text-muted-foreground">
          <Dumbbell className="h-12 w-12 mx-auto mb-4 text-muted" strokeWidth={1.5} />
          <p className="font-medium mb-1">Nenhum treino ainda</p>
          <p className="text-sm">Aguarde seu personal enviar um treino para você.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {data.data.map((w) => (
            <Link key={w.id} to={`/student/workouts/${w.id}`}>
              <Card padding="md" className="flex items-center gap-3 sm:gap-4 hover:border-border hover:shadow-md transition-all cursor-pointer">
                <div className="h-11 w-11 sm:h-12 sm:w-12 shrink-0 flex items-center justify-center rounded-2xl bg-accent text-primary">
                  <Dumbbell className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-foreground">{w.title}</span>
                    <Badge variant="default">{TYPE_MAP[w.type] ?? w.type}</Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5 text-sm text-muted-foreground">
                    {w.workoutExercises?.length !== undefined && (
                      <span className="flex items-center gap-1">
                        <CheckCircle className="h-3.5 w-3.5" />
                        {w.workoutExercises.length} exercícios
                      </span>
                    )}
                    {w.estimatedDurationMinutes && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        ~{w.estimatedDurationMinutes} min
                      </span>
                    )}
                    {w.sentAt && (
                      <span>Recebido em {format(new Date(w.sentAt), "d 'de' MMM", { locale: ptBR })}</span>
                    )}
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" strokeWidth={1.5} />
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
