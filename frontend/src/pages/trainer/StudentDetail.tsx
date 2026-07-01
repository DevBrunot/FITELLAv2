import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, UserCheck, UserX, Calendar, Phone, Mail, Baby } from 'lucide-react'
import { studentsApi } from '@/api/students'
import { Card, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { PageSpinner } from '@/components/ui/Spinner'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const STATUS_MAP = {
  pending: { label: 'Pendente', variant: 'warning' as const },
  approved: { label: 'Ativa', variant: 'success' as const },
  rejected: { label: 'Rejeitada', variant: 'danger' as const },
}

export function StudentDetail() {
  const { id } = useParams<{ id: string }>()
  const qc = useQueryClient()

  const { data: student, isLoading } = useQuery({
    queryKey: ['student', id],
    queryFn: () => studentsApi.get(id!),
  })
  const { data: anamnesis } = useQuery({
    queryKey: ['student-anamnesis', id],
    queryFn: () => studentsApi.getAnamnesis(id!),
  })

  const approveMutation = useMutation({
    mutationFn: () => studentsApi.approve(id!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['student', id] }),
  })
  const rejectMutation = useMutation({
    mutationFn: () => studentsApi.reject(id!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['student', id] }),
  })

  if (isLoading) return <PageSpinner />
  if (!student) return null

  const status = STATUS_MAP[student.status]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/trainer/students">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="page-title">{student.name}</h1>
        <Badge variant={status.variant}>{status.label}</Badge>
      </div>

      {/* Actions */}
      {student.status === 'pending' && (
        <div className="flex gap-3">
          <Button onClick={() => approveMutation.mutate()} loading={approveMutation.isPending} className="gap-2">
            <UserCheck className="h-4 w-4" /> Aprovar aluna
          </Button>
          <Button variant="danger" onClick={() => rejectMutation.mutate()} loading={rejectMutation.isPending} className="gap-2">
            <UserX className="h-4 w-4" /> Rejeitar
          </Button>
        </div>
      )}

      {/* Info cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card padding="md">
          <CardHeader><h2 className="section-title">Informações</h2></CardHeader>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Mail className="h-4 w-4 text-gray-400" /> {student.email}
            </div>
            {student.phone && (
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="h-4 w-4 text-gray-400" /> {student.phone}
              </div>
            )}
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="h-4 w-4 text-gray-400" />
              Cadastrada em {format(new Date(student.createdAt), "d 'de' MMM 'de' yyyy", { locale: ptBR })}
            </div>
          </div>
        </Card>

        {anamnesis && (
          <Card padding="md">
            <CardHeader>
              <h2 className="section-title">Anamnese</h2>
              <Baby className="h-4 w-4 text-rose-400" />
            </CardHeader>
            <div className="space-y-2 text-sm text-gray-600">
              {anamnesis.isPostPartum ? (
                <p>Pós-parto — {anamnesis.weeksPostPartum} semanas</p>
              ) : anamnesis.gestationalWeeks ? (
                <p>{anamnesis.gestationalWeeks} semanas gestacionais</p>
              ) : null}
              {anamnesis.dueDate && (
                <p>Previsão de parto: {format(new Date(anamnesis.dueDate), "d 'de' MMM 'de' yyyy", { locale: ptBR })}</p>
              )}
              {anamnesis.hasPreviousExerciseHistory && <p>✓ Histórico de exercícios anterior</p>}
              {anamnesis.medicalRestrictions && (
                <div>
                  <span className="font-medium text-red-600">Restrições:</span>{' '}
                  {anamnesis.medicalRestrictions}
                </div>
              )}
              {anamnesis.doctorName && (
                <p>Médico: {anamnesis.doctorName} {anamnesis.doctorPhone && `— ${anamnesis.doctorPhone}`}</p>
              )}
              {anamnesis.healthObservations && (
                <div className="mt-2 p-2 bg-gray-50 rounded-lg text-gray-500">
                  {anamnesis.healthObservations}
                </div>
              )}
            </div>
          </Card>
        )}
      </div>

      {!anamnesis && (
        <Card padding="md" className="text-center text-gray-400 py-8">
          Aluna ainda não preencheu a anamnese.
        </Card>
      )}
    </div>
  )
}
