import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Play, CheckCircle, Star, Youtube, Clock, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react'
import { studentWorkoutsApi, feedbackApi } from '@/api/studentWorkouts'
import { ExerciseVideoPlayer } from '@/components/ExerciseVideoPlayer'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { PageSpinner } from '@/components/ui/Spinner'

export function WorkoutSession() {
  const { id } = useParams<{ id: string }>()
  const qc = useQueryClient()

  const [executionId, setExecutionId] = useState<string | null>(null)
  const [isActive, setIsActive] = useState(false)
  const [feedbackModal, setFeedbackModal] = useState(false)
  const [rating, setRating] = useState(5)
  const [effort, setEffort] = useState('')
  const [comment, setComment] = useState('')
  const [painOrDiscomfort, setPainOrDiscomfort] = useState('')
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null)

  const { data: workout, isLoading } = useQuery({
    queryKey: ['student-workout', id],
    queryFn: () => studentWorkoutsApi.get(id!),
  })

  const startMutation = useMutation({
    mutationFn: () => studentWorkoutsApi.start(id!),
    onSuccess: (exec) => {
      setExecutionId(exec.id)
      setIsActive(true)
    },
  })

  const finishMutation = useMutation({
    mutationFn: () => studentWorkoutsApi.finish(id!, executionId ?? undefined),
    onSuccess: () => {
      setIsActive(false)
      setFeedbackModal(true)
      qc.invalidateQueries({ queryKey: ['student-workout', id] })
    },
  })

  const feedbackMutation = useMutation({
    mutationFn: () =>
      feedbackApi.submit(id!, { rating, effort: effort || undefined, comment: comment || undefined, painOrDiscomfort: painOrDiscomfort || undefined }),
    onSuccess: () => setFeedbackModal(false),
  })

  if (isLoading) return <PageSpinner />
  if (!workout) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/student/workouts">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="page-title">{workout.title}</h1>
          {workout.description && (
            <p className="text-gray-500 text-sm mt-0.5">{workout.description}</p>
          )}
        </div>
      </div>

      {/* Start / Finish */}
      <Card padding="md" className="flex items-center gap-4">
        {!isActive ? (
          <Button
            size="lg"
            className="gap-2 bg-rose-500 hover:bg-rose-600 focus:ring-rose-400"
            onClick={() => startMutation.mutate()}
            loading={startMutation.isPending}
          >
            <Play className="h-5 w-5" /> Iniciar treino
          </Button>
        ) : (
          <>
            <div className="flex items-center gap-2 text-green-600">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-medium">Treino em andamento</span>
            </div>
            <Button
              size="lg"
              variant="secondary"
              className="gap-2 ml-auto"
              onClick={() => finishMutation.mutate()}
              loading={finishMutation.isPending}
            >
              <CheckCircle className="h-5 w-5" /> Finalizar treino
            </Button>
          </>
        )}
      </Card>

      {/* Exercises */}
      <div className="space-y-3">
        {workout.workoutExercises?.map((we, idx) => {
          const isExpanded = expandedExerciseId === we.id
          const hasVideo = we.exercise.videoType || we.exercise.youtubeUrl || we.exercise.videoUrl

          return (
            <Card key={we.id} padding="md" className="overflow-hidden">
              <button
                type="button"
                className="flex w-full gap-4 text-left"
                onClick={() => setExpandedExerciseId(isExpanded ? null : we.id)}
              >
                <div className="h-20 w-28 shrink-0 rounded-xl bg-gray-100 overflow-hidden">
                  {we.exercise.thumbnail ? (
                    <img src={we.exercise.thumbnail} alt={we.exercise.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <Youtube className="h-6 w-6 text-gray-300" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-medium text-gray-400">#{idx + 1}</span>
                      <p className="font-semibold text-gray-900">{we.exercise.name}</p>
                    </div>
                    <span className="shrink-0 text-gray-400">
                      {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <RotateCcw className="h-3.5 w-3.5 text-gray-400" />
                      {we.sets} {we.sets === 1 ? 'série' : 'séries'}
                    </span>
                    {we.useTime ? (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-gray-400" />
                        {we.timeOn}s por série
                      </span>
                    ) : (
                      <span>{we.reps} repetições</span>
                    )}
                    {we.restSeconds && (
                      <span className="text-gray-400">{we.restSeconds}s descanso</span>
                    )}
                  </div>
                </div>
              </button>

              {isExpanded && (
                <div className="mt-4 space-y-4 border-t border-gray-100 pt-4">
                  {hasVideo && (
                    <ExerciseVideoPlayer exercise={we.exercise} />
                  )}

                  {we.notes && (
                    <p className="text-sm text-primary-700 bg-primary-50 px-3 py-2 rounded-lg">
                      {we.notes}
                    </p>
                  )}

                  {idx < (workout.workoutExercises?.length ?? 0) - 1 && (
                    <Button
                      variant="secondary"
                      className="w-full"
                      onClick={() => setExpandedExerciseId(workout.workoutExercises![idx + 1].id)}
                    >
                      Próximo exercício
                    </Button>
                  )}
                </div>
              )}
            </Card>
          )
        })}
      </div>

      {/* Feedback modal */}
      <Modal open={feedbackModal} onClose={() => setFeedbackModal(false)} title="Como foi o treino?">
        <div className="space-y-4">
          {/* Stars */}
          <div>
            <p className="label">Avaliação</p>
            <div className="flex gap-2 mt-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} type="button" onClick={() => setRating(s)}>
                  <Star
                    className={`h-8 w-8 transition-colors ${s <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`}
                  />
                </button>
              ))}
            </div>
          </div>

          <Select
            label="Nível de esforço"
            value={effort}
            onChange={(e) => setEffort(e.target.value)}
            options={[
              { value: 'easy', label: 'Fácil' },
              { value: 'moderate', label: 'Moderado' },
              { value: 'hard', label: 'Difícil' },
            ]}
            placeholder="Selecione…"
          />

          <Textarea
            label="Comentário (opcional)"
            placeholder="Como você se sentiu durante o treino?"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          <Textarea
            label="Dor ou desconforto (opcional)"
            placeholder="Sente alguma dor? Onde?"
            value={painOrDiscomfort}
            onChange={(e) => setPainOrDiscomfort(e.target.value)}
            rows={2}
          />

          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setFeedbackModal(false)}>Pular</Button>
            <Button
              loading={feedbackMutation.isPending}
              onClick={() => feedbackMutation.mutate()}
              className="bg-rose-500 hover:bg-rose-600 focus:ring-rose-400"
            >
              Enviar feedback
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
