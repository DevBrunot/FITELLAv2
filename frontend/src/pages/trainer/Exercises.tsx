import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, Youtube } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { exercisesApi, type CreateExerciseDto } from '@/api/exercises'
import { ExerciseVideoPlayer } from '@/components/ExerciseVideoPlayer'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { Pagination } from '@/components/ui/Pagination'
import { PageSpinner } from '@/components/ui/Spinner'
import type { Exercise } from '@/types'
import { extractYoutubeVideoId } from '@/utils/exercise-video'

const CATEGORIES = [
  { value: 'strength', label: 'Força' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'mobility', label: 'Mobilidade' },
  { value: 'relaxation', label: 'Relaxamento' },
  { value: 'breathing', label: 'Respiração' },
]

const CATEGORY_LABELS: Record<string, string> = {
  strength: 'Força', cardio: 'Cardio', mobility: 'Mobilidade',
  relaxation: 'Relaxamento', breathing: 'Respiração',
}

const schema = z.object({
  name: z.string().min(2, 'Nome obrigatório'),
  description: z.string().optional(),
  youtubeUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  category: z.string().min(1, 'Selecione uma categoria'),
  postPartumOnly: z.boolean().optional(),
})
type FormData = z.infer<typeof schema>

export function Exercises() {
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['exercises', page],
    queryFn: () => exercisesApi.list(page),
  })

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const youtubeUrl = watch('youtubeUrl')
  const exerciseName = watch('name') || 'Exercício'
  const previewVideoId = youtubeUrl ? extractYoutubeVideoId(youtubeUrl) : null

  const createMutation = useMutation({
    mutationFn: (d: FormData) =>
      editingId
        ? exercisesApi.update(editingId, d as CreateExerciseDto)
        : exercisesApi.create(d as CreateExerciseDto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['exercises'] })
      setModalOpen(false)
      reset()
      setEditingId(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: exercisesApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['exercises'] }),
  })

  const openCreate = () => { reset({}); setEditingId(null); setModalOpen(true) }

  if (isLoading) return <PageSpinner />

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Exercícios</h1>
          <p className="text-muted-foreground text-sm mt-1">{data?.total ?? 0} exercícios na biblioteca</p>
        </div>
        <Button onClick={openCreate} className="gap-2 w-full sm:w-auto">
          <Plus className="h-4 w-4" /> Novo exercício
        </Button>
      </div>

      {!data?.data.length ? (
        <Card padding="md" className="text-center py-12 text-muted-foreground">
          <Youtube className="h-10 w-10 mx-auto mb-3 text-muted" strokeWidth={1.5} />
          Nenhum exercício ainda. Adicione o primeiro!
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.data.map((ex: Exercise) => (
            <Card key={ex.id} padding="md" className="flex gap-3">
              {/* Thumbnail */}
              <div className="h-16 w-20 sm:h-20 sm:w-28 shrink-0 rounded-lg bg-muted overflow-hidden">
                {ex.thumbnail ? (
                  <img src={ex.thumbnail} alt={ex.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <Youtube className="h-6 w-6 text-muted" strokeWidth={1.5} />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-foreground text-sm">{ex.name}</p>
                    <div className="flex gap-1.5 mt-1 flex-wrap">
                      <Badge variant="purple">{CATEGORY_LABELS[ex.category] ?? ex.category}</Badge>
                      {ex.postPartumOnly && <Badge variant="info">Pós-parto</Badge>}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        if (confirm('Excluir exercício?')) deleteMutation.mutate(ex.id)
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                {ex.description && (
                  <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{ex.description}</p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Pagination page={page} total={data?.total ?? 0} limit={20} onChange={setPage} />

      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); reset(); setEditingId(null) }}
        title={editingId ? 'Editar exercício' : 'Novo exercício'}
        size="lg"
      >
        <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-4">
          <Input label="Nome" placeholder="Agachamento com apoio" error={errors.name?.message} {...register('name')} />
          <Textarea label="Descrição" placeholder="Instruções do exercício…" {...register('description')} />
          <Input
            label="URL do YouTube"
            placeholder="https://youtube.com/watch?v=..."
            error={errors.youtubeUrl?.message}
            {...register('youtubeUrl')}
          />
          {previewVideoId && (
            <ExerciseVideoPlayer
              exercise={{
                name: exerciseName,
                videoType: 'youtube',
                youtubeUrl: youtubeUrl ?? undefined,
                videoId: previewVideoId,
                thumbnail: `https://img.youtube.com/vi/${previewVideoId}/maxresdefault.jpg`,
              }}
            />
          )}
          <Select
            label="Categoria"
            options={CATEGORIES}
            placeholder="Selecione…"
            error={errors.category?.message}
            {...register('category')}
          />
          <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
            <input type="checkbox" className="rounded border-input text-primary accent-primary" {...register('postPartumOnly')} />
            Apenas pós-parto
          </label>
          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end sm:gap-3">
            <Button type="button" variant="secondary" className="w-full sm:w-auto" onClick={() => { setModalOpen(false); reset() }}>
              Cancelar
            </Button>
            <Button type="submit" loading={createMutation.isPending} className="w-full sm:w-auto">
              {editingId ? 'Salvar' : 'Criar exercício'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
