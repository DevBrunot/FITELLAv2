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
        <p className="text-gray-500 text-sm mt-1">Treinos enviados pelo seu personal</p>
      </div>

      {!data?.data.length ? (
        <Card padding="md" className="text-center py-16 text-gray-400">
          <Dumbbell className="h-12 w-12 mx-auto mb-4 text-gray-200" />
          <p className="font-medium text-gray-500 mb-1">Nenhum treino ainda</p>
          <p className="text-sm">Aguarde seu personal enviar um treino para você.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {data.data.map((w) => (
            <Link key={w.id} to={`/student/workouts/${w.id}`}>
              <Card padding="md" className="flex items-center gap-4 hover:border-rose-200 hover:shadow-md transition-all cursor-pointer">
                <div className="h-12 w-12 shrink-0 flex items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
                  <Dumbbell className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900">{w.title}</span>
                    <Badge variant="default">{TYPE_MAP[w.type] ?? w.type}</Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-sm text-gray-500">
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
                <ChevronRight className="h-5 w-5 text-gray-400 shrink-0" />
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
