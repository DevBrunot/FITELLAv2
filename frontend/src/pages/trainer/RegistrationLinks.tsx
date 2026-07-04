import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Copy, Trash2, Link2, CheckCheck } from 'lucide-react'
import { registrationLinksApi } from '@/api/registrationLinks'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import { Input } from '@/components/ui/Input'
import { Pagination } from '@/components/ui/Pagination'
import { PageSpinner } from '@/components/ui/Spinner'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function RegistrationLinks() {
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [linkType, setLinkType] = useState<'permanent' | 'expirable'>('permanent')
  const [expiresInDays, setExpiresInDays] = useState('7')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['links', page],
    queryFn: () => registrationLinksApi.list(page),
  })

  const createMutation = useMutation({
    mutationFn: () =>
      registrationLinksApi.create({
        linkType,
        expiresInDays: linkType === 'expirable' ? Number(expiresInDays) : undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['links'] })
      setModalOpen(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: registrationLinksApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['links'] }),
  })

  const copyCode = async (code: string, id: string) => {
    await navigator.clipboard.writeText(code)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const copyLink = async (code: string, id: string) => {
    const url = `${window.location.origin}/student/register?code=${code}`
    await navigator.clipboard.writeText(url)
    setCopiedId(`link-${id}`)
    setTimeout(() => setCopiedId(null), 2000)
  }

  if (isLoading) return <PageSpinner />

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Links de convite</h1>
          <p className="text-muted-foreground text-sm mt-1">Gere códigos para suas alunas se cadastrarem</p>
        </div>
        <Button onClick={() => setModalOpen(true)} className="gap-2 w-full sm:w-auto">
          <Plus className="h-4 w-4" /> Gerar código
        </Button>
      </div>

      {!data?.data.length ? (
        <Card padding="md" className="text-center py-12 text-muted-foreground">
          <Link2 className="h-10 w-10 mx-auto mb-3 text-muted" strokeWidth={1.5} />
          Nenhum link gerado ainda.
        </Card>
      ) : (
        <div className="space-y-3">
          {data.data.map((link) => (
            <Card key={link.id} padding="md" className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <code className="text-base sm:text-lg font-mono font-bold text-primary tracking-widest break-all">
                    {link.code}
                  </code>
                  <Badge variant={link.isActive ? 'success' : 'default'}>
                    {link.isActive ? 'Ativo' : 'Inativo'}
                  </Badge>
                  <Badge variant={link.linkType === 'permanent' ? 'purple' : 'warning'}>
                    {link.linkType === 'permanent' ? 'Permanente' : 'Expirável'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Criado em {format(new Date(link.createdAt), "d 'de' MMM 'de' yyyy", { locale: ptBR })}
                  {link.expiresAt && ` · Expira em ${format(new Date(link.expiresAt), "d 'de' MMM", { locale: ptBR })}`}
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5 shrink-0">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => copyCode(link.code, link.id)}
                  className="gap-1.5 text-xs"
                >
                  {copiedId === link.id ? <CheckCheck className="h-3.5 w-3.5 text-secondary" /> : <Copy className="h-3.5 w-3.5" />}
                  Código
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => copyLink(link.code, link.id)}
                  className="gap-1.5 text-xs"
                >
                  {copiedId === `link-${link.id}` ? <CheckCheck className="h-3.5 w-3.5 text-secondary" /> : <Link2 className="h-3.5 w-3.5" />}
                  Link
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => { if (confirm('Desativar este código?')) deleteMutation.mutate(link.id) }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Pagination page={page} total={data?.total ?? 0} limit={20} onChange={setPage} />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Gerar código de convite">
        <div className="space-y-4">
          <Select
            label="Tipo de código"
            value={linkType}
            onChange={(e) => setLinkType(e.target.value as 'permanent' | 'expirable')}
            options={[
              { value: 'permanent', label: 'Permanente (sem prazo)' },
              { value: 'expirable', label: 'Expirável' },
            ]}
          />
          {linkType === 'expirable' && (
            <Input
              label="Expira em (dias)"
              type="number"
              min={1}
              max={365}
              value={expiresInDays}
              onChange={(e) => setExpiresInDays(e.target.value)}
            />
          )}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
            <Button variant="secondary" onClick={() => setModalOpen(false)} className="w-full sm:w-auto">Cancelar</Button>
            <Button loading={createMutation.isPending} onClick={() => createMutation.mutate()} className="w-full sm:w-auto">
              Gerar código
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
