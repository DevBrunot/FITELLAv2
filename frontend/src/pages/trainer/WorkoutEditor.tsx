import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Plus, Trash2, GripVertical } from 'lucide-react'
import { workoutsApi } from '@/api/workouts'
import { exercisesApi } from '@/api/exercises'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Card } from '@/components/ui/Card'
import { PageSpinner } from '@/components/ui/Spinner'

const exerciseSchema = z.object({
  exerciseId: z.string().min(1, 'Obrigatório'),
  sets: z.coerce.number().min(1).default(1),
  useTime: z.boolean().default(false),
  reps: z.coerce.number().min(1).optional(),
  timeOn: z.coerce.number().min(1).optional(),
  restSeconds: z.coerce.number().optional(),
  notes: z.string().optional(),
})

const schema = z.object({
  title: z.string().min(2, 'Título obrigatório'),
  description: z.string().optional(),
  type: z.enum(['gestational', 'post_partum', 'general']),
  isTemplate: z.boolean().optional(),
  exercises: z.array(exerciseSchema),
})
type FormData = z.infer<typeof schema>

const WORKOUT_TYPES = [
  { value: 'gestational', label: 'Gestacional' },
  { value: 'post_partum', label: 'Pós-parto' },
  { value: 'general', label: 'Geral' },
]

export function WorkoutEditor() {
  const { id } = useParams<{ id?: string }>()
  const isEditing = !!id
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: existingWorkout, isLoading: loadingWorkout } = useQuery({
    queryKey: ['workout', id],
    queryFn: () => workoutsApi.get(id!),
    enabled: isEditing,
  })
  const { data: exercisesData } = useQuery({
    queryKey: ['exercises-all'],
    queryFn: () => exercisesApi.list(1, 200),
  })

  const exerciseOptions = (exercisesData?.data ?? []).map((e) => ({
    value: e.id,
    label: e.name,
  }))

  const { register, handleSubmit, watch, control, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: isEditing && existingWorkout
      ? {
          title: existingWorkout.title,
          description: existingWorkout.description ?? '',
          type: existingWorkout.type as 'gestational' | 'post_partum' | 'general',
          isTemplate: existingWorkout.isTemplate,
          exercises: existingWorkout.workoutExercises?.map((we) => ({
            exerciseId: we.exerciseId,
            sets: we.sets,
            useTime: we.useTime,
            reps: we.reps ?? undefined,
            timeOn: we.timeOn ?? undefined,
            restSeconds: we.restSeconds ?? undefined,
            notes: we.notes ?? '',
          })) ?? [],
        }
      : { type: 'gestational', exercises: [] },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'exercises' })
  const watchedExercises = watch('exercises')

  const saveMutation = useMutation({
    mutationFn: (data: FormData) => {
      const payload = {
        ...data,
        exercises: data.exercises.map((e, i) => ({ ...e, order: i })),
      }
      return isEditing
        ? workoutsApi.update(id!, payload)
        : workoutsApi.create(payload)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workouts'] })
      navigate('/trainer/workouts')
    },
  })

  if (isEditing && loadingWorkout) return <PageSpinner />

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/trainer/workouts">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="page-title">{isEditing ? 'Editar treino' : 'Novo treino'}</h1>
      </div>

      <form onSubmit={handleSubmit((d) => saveMutation.mutate(d))} className="space-y-6">
        {/* Basic info */}
        <Card padding="md" className="space-y-4">
          <h2 className="section-title">Informações básicas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input label="Título" placeholder="Ex: Treino de força — 2º trimestre" error={errors.title?.message} {...register('title')} />
            </div>
            <Select label="Tipo" options={WORKOUT_TYPES} error={errors.type?.message} {...register('type')} />
            <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer self-end pb-2">
              <input type="checkbox" className="rounded border-input text-primary accent-primary" {...register('isTemplate')} />
              Salvar como template
            </label>
          </div>
          <Textarea label="Descrição (opcional)" placeholder="Orientações gerais…" rows={2} {...register('description')} />
        </Card>

        {/* Exercises */}
        <Card padding="md" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="section-title">Exercícios</h2>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => append({ exerciseId: '', sets: 1, useTime: false })}
              className="gap-2"
            >
              <Plus className="h-4 w-4" /> Adicionar
            </Button>
          </div>

          {fields.length === 0 && (
            <p className="text-center text-muted-foreground py-6">
              Nenhum exercício adicionado. Clique em "Adicionar".
            </p>
          )}

          <div className="space-y-4">
            {fields.map((field, idx) => {
              const useTime = watchedExercises[idx]?.useTime
              return (
                <div key={field.id} className="border border-border rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-muted shrink-0" strokeWidth={1.5} />
                    <span className="text-xs font-medium text-muted-foreground mr-auto">Exercício {idx + 1}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => remove(idx)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <Select
                    label="Exercício"
                    options={exerciseOptions}
                    placeholder="Selecione…"
                    error={(errors.exercises?.[idx] as { exerciseId?: { message?: string } })?.exerciseId?.message}
                    {...register(`exercises.${idx}.exerciseId`)}
                  />

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Input label="Séries" type="number" min={1} {...register(`exercises.${idx}.sets`)} />
                    <div className="col-span-2 flex items-center gap-2 self-end pb-2">
                      <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                        <input type="checkbox" className="rounded border-input text-primary accent-primary" {...register(`exercises.${idx}.useTime`)} />
                        Usar tempo
                      </label>
                    </div>
                    {useTime ? (
                      <Input label="Tempo (seg)" type="number" min={1} {...register(`exercises.${idx}.timeOn`)} />
                    ) : (
                      <Input label="Repetições" type="number" min={1} {...register(`exercises.${idx}.reps`)} />
                    )}
                    <Input label="Descanso (seg)" type="number" min={0} {...register(`exercises.${idx}.restSeconds`)} />
                  </div>

                  <Input label="Observações" placeholder="Instruções específicas…" {...register(`exercises.${idx}.notes`)} />
                </div>
              )
            })}
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <Link to="/trainer/workouts">
            <Button variant="secondary">Cancelar</Button>
          </Link>
          <Button type="submit" loading={saveMutation.isPending} size="lg">
            {isEditing ? 'Salvar alterações' : 'Criar treino'}
          </Button>
        </div>
      </form>
    </div>
  )
}
