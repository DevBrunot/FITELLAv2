import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FileText, Shield } from 'lucide-react'
import { anamnesisApi } from '@/api/anamnesis'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { PageSpinner } from '@/components/ui/Spinner'

const schema = z.object({
  gestationalWeeks: z.coerce.number().min(0).max(45).optional(),
  dueDate: z.string().optional(),
  isPostPartum: z.boolean().optional(),
  weeksPostPartum: z.coerce.number().optional(),
  hasPreviousExerciseHistory: z.boolean().optional(),
  medicalRestrictions: z.string().optional(),
  healthObservations: z.string().optional(),
  doctorName: z.string().optional(),
  doctorPhone: z.string().optional(),
  lgpdConsent: z.literal(true, { errorMap: () => ({ message: 'Você precisa aceitar para continuar' }) }),
})
type FormData = z.infer<typeof schema>

export function Anamnesis() {
  const qc = useQueryClient()

  const { data: existing, isLoading } = useQuery({
    queryKey: ['anamnesis-me'],
    queryFn: anamnesisApi.getMe,
  })

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: existing
      ? {
          gestationalWeeks: existing.gestationalWeeks ?? undefined,
          dueDate: existing.dueDate?.split('T')[0] ?? '',
          isPostPartum: existing.isPostPartum ?? false,
          weeksPostPartum: existing.weeksPostPartum ?? undefined,
          hasPreviousExerciseHistory: existing.hasPreviousExerciseHistory ?? false,
          medicalRestrictions: existing.medicalRestrictions ?? '',
          healthObservations: existing.healthObservations ?? '',
          doctorName: existing.doctorName ?? '',
          doctorPhone: existing.doctorPhone ?? '',
          lgpdConsent: true,
        }
      : {},
  })

  const isPostPartum = watch('isPostPartum')

  const saveMutation = useMutation({
    mutationFn: (data: FormData) =>
      existing
        ? anamnesisApi.updateMe(data)
        : anamnesisApi.create({ ...data, lgpdConsent: true }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['anamnesis-me'] }),
  })

  if (isLoading) return <PageSpinner />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Anamnese</h1>
        <p className="text-gray-500 text-sm mt-1">
          Informações de saúde para seu personal personalizar seus treinos
        </p>
      </div>

      {existing && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
          <FileText className="h-4 w-4" /> Anamnese já preenchida — você pode atualizá-la abaixo.
        </div>
      )}

      <form onSubmit={handleSubmit((d) => saveMutation.mutate(d))} className="space-y-6">
        {/* Gestacional / Pós-parto */}
        <Card padding="md" className="space-y-4">
          <h2 className="section-title">Situação atual</h2>

          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" className="rounded border-gray-300 text-rose-500" {...register('isPostPartum')} />
            Estou no pós-parto
          </label>

          {isPostPartum ? (
            <Input
              label="Semanas pós-parto"
              type="number"
              min={0}
              placeholder="Ex: 6"
              error={errors.weeksPostPartum?.message}
              {...register('weeksPostPartum')}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Semanas gestacionais"
                type="number"
                min={0}
                max={45}
                placeholder="Ex: 20"
                error={errors.gestationalWeeks?.message}
                {...register('gestationalWeeks')}
              />
              <Input
                label="Previsão do parto"
                type="date"
                error={errors.dueDate?.message}
                {...register('dueDate')}
              />
            </div>
          )}

          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" className="rounded border-gray-300 text-rose-500" {...register('hasPreviousExerciseHistory')} />
            Já praticava exercícios antes da gestação
          </label>
        </Card>

        {/* Saúde */}
        <Card padding="md" className="space-y-4">
          <h2 className="section-title">Informações de saúde</h2>
          <Textarea
            label="Restrições médicas"
            placeholder="Informe restrições prescritas pelo seu médico…"
            {...register('medicalRestrictions')}
          />
          <Textarea
            label="Observações de saúde"
            placeholder="Outros aspectos que seu personal deve saber…"
            {...register('healthObservations')}
          />
        </Card>

        {/* Médico */}
        <Card padding="md" className="space-y-4">
          <h2 className="section-title">Médico responsável</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Nome do médico" placeholder="Dra. Ana Lima" {...register('doctorName')} />
            <Input label="Telefone do médico" type="tel" placeholder="(11) 99999-9999" {...register('doctorPhone')} />
          </div>
        </Card>

        {/* LGPD */}
        {!existing && (
          <Card padding="md" className="border-primary-100 bg-primary-50/40">
            <div className="flex gap-3">
              <Shield className="h-5 w-5 text-primary-500 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-900">Consentimento LGPD</p>
                <p className="text-xs text-gray-600">
                  Seus dados de saúde serão usados exclusivamente para personalização dos treinos pelo seu personal trainer.
                  Não serão compartilhados com terceiros sem seu consentimento.
                </p>
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer mt-2">
                  <input type="checkbox" className="rounded border-gray-300 text-primary-600" {...register('lgpdConsent')} />
                  Aceito o uso dos meus dados conforme descrito acima
                </label>
                {errors.lgpdConsent && (
                  <p className="text-xs text-red-600">{errors.lgpdConsent.message}</p>
                )}
              </div>
            </div>
          </Card>
        )}

        {saveMutation.isSuccess && (
          <p className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
            Anamnese salva com sucesso!
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          loading={saveMutation.isPending}
          className="w-full bg-rose-500 hover:bg-rose-600 focus:ring-rose-400"
        >
          {existing ? 'Atualizar anamnese' : 'Enviar anamnese'}
        </Button>
      </form>
    </div>
  )
}
