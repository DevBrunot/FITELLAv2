import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Plus, Trash2, Send, BookmarkCheck, ChevronRight, Dumbbell } from 'lucide-react'
import { workoutsApi } from '@/api/workouts'
import { studentsApi } from '@/api/students'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Pagination } from '@/components/ui/Pagination'
import { PageSpinner } from '@/components/ui/Spinner'
import type { Workout } from '@/types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const TYPE_MAP: Record<string, { label: string; variant: 'purple' | 'info' | 'default' }> = {
  gestational: { label: 'Gestacional', variant: 'purple' },
  post_partum: { label: 'Pós-parto', variant: 'info' },
  general: { label: 'Geral', variant: 'default' },
}

export function Workouts() {
  const [page, setPage] = useState(1)
  const [sendModalId, setSendModalId] = useState<string | null>(null)
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([])
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['workouts', page],
    queryFn: () => workoutsApi.list(page),
  })
  const { data: studentsData } = useQuery({
    queryKey: ['students-all'],
    queryFn: () => studentsApi.list(1, 100),
    enabled: !!sendModalId,
  })

  const deleteMutation = useMutation({
    mutationFn: workoutsApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workouts'] }),
  })
  const templateMutation = useMutation({
    mutationFn: workoutsApi.saveAsTemplate,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workouts'] }),
  })
  const sendMutation = useMutation({
    mutationFn: ({ id, studentIds }: { id: string; studentIds: string[] }) =>
      workoutsApi.send(id, studentIds),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workouts'] })
      setSendModalId(null)
      setSelectedStudentIds([])
    },
  })

  const toggleStudent = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    )
  }

  if (isLoading) return <PageSpinner />

  const approvedStudents = (studentsData?.data ?? [])
    .filter((s) => s.status === 'approved')
    .map((s) => ({ value: s.id, label: s.name }))

  const selectAllStudents = () => {
    setSelectedStudentIds(approvedStudents.map((s) => s.value))
  }

  const closeSendModal = () => {
    setSendModalId(null)
    setSelectedStudentIds([])
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Treinos</h1>
          <p className="text-muted-foreground text-sm mt-1">{data?.total ?? 0} treinos</p>
        </div>
        <Link to="/trainer/workouts/new" className="w-full sm:w-auto">
          <Button className="gap-2 w-full sm:w-auto">
            <Plus className="h-4 w-4" /> Novo treino
          </Button>
        </Link>
      </div>

      {!data?.data.length ? (
        <Card padding="md" className="text-center py-12 text-muted-foreground">
          <Dumbbell className="h-10 w-10 mx-auto mb-3 text-muted" strokeWidth={1.5} />
          Nenhum treino ainda. Crie o primeiro!
        </Card>
      ) : (
        <div className="space-y-3">
          {data.data.map((w: Workout) => {
            const type = TYPE_MAP[w.type] ?? { label: w.type, variant: 'default' as const }
            return (
              <Card key={w.id} padding="md" className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-foreground">{w.title}</span>
                    <Badge variant={type.variant}>{type.label}</Badge>
                    {w.isTemplate && <Badge variant="success">Template</Badge>}
                    {w.sentAt && <Badge>Enviado</Badge>}
                  </div>
                  <div className="text-sm text-muted-foreground mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                    {w.workoutExercises?.length !== undefined && (
                      <span>{w.workoutExercises.length} exercícios</span>
                    )}
                    {w.estimatedDurationMinutes && <span>~{w.estimatedDurationMinutes} min</span>}
                    {w.student && <span>→ {w.student.name}</span>}
                    <span>{format(new Date(w.createdAt), "d MMM", { locale: ptBR })}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                  {!w.isTemplate && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary"
                      onClick={() => templateMutation.mutate(w.id)}
                      title="Salvar como template"
                    >
                      <BookmarkCheck className="h-4 w-4" />
                    </Button>
                  )}
                  {(w.isTemplate || !w.sentAt) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-secondary"
                      onClick={() => { setSendModalId(w.id); setSelectedStudentIds([]) }}
                      title="Enviar para alunas"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => { if (confirm('Excluir treino?')) deleteMutation.mutate(w.id) }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Link to={`/trainer/workouts/${w.id}`}>
                    <Button variant="ghost" size="sm">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Pagination page={page} total={data?.total ?? 0} limit={20} onChange={setPage} />

      {/* Send modal */}
      <Modal
        open={!!sendModalId}
        onClose={closeSendModal}
        title="Enviar treino para alunas"
      >
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="label mb-0">Selecione as alunas</p>
              {approvedStudents.length > 0 && (
                <button
                  type="button"
                  className="text-xs text-primary hover:underline"
                  onClick={selectAllStudents}
                >
                  Selecionar todas
                </button>
              )}
            </div>
            {approvedStudents.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma aluna aprovada disponível.</p>
            ) : (
              <ul className="max-h-56 space-y-2 overflow-y-auto rounded-lg border border-border p-3">
                {approvedStudents.map((student) => (
                  <li key={student.value}>
                    <label className="flex cursor-pointer items-center gap-3 text-sm text-foreground">
                      <input
                        type="checkbox"
                        className="rounded border-input text-primary accent-primary"
                        checked={selectedStudentIds.includes(student.value)}
                        onChange={() => toggleStudent(student.value)}
                      />
                      {student.label}
                    </label>
                  </li>
                ))}
              </ul>
            )}
            {selectedStudentIds.length > 0 && (
              <p className="mt-2 text-xs text-muted-foreground">
                {selectedStudentIds.length} aluna{selectedStudentIds.length > 1 ? 's' : ''} selecionada{selectedStudentIds.length > 1 ? 's' : ''}
              </p>
            )}
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
            <Button variant="secondary" onClick={closeSendModal} className="w-full sm:w-auto">Cancelar</Button>
            <Button
              disabled={selectedStudentIds.length === 0}
              loading={sendMutation.isPending}
              onClick={() => sendModalId && sendMutation.mutate({ id: sendModalId, studentIds: selectedStudentIds })}
              className="w-full sm:w-auto"
            >
              <Send className="h-4 w-4" /> Enviar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
