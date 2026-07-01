import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { UserCheck, UserX, ChevronRight, Search } from 'lucide-react'
import { studentsApi } from '@/api/students'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Pagination } from '@/components/ui/Pagination'
import { PageSpinner } from '@/components/ui/Spinner'
import type { Student } from '@/types'

const STATUS_MAP = {
  pending: { label: 'Pendente', variant: 'warning' as const },
  approved: { label: 'Ativa', variant: 'success' as const },
  rejected: { label: 'Rejeitada', variant: 'danger' as const },
}

export function Students() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['students', page],
    queryFn: () => studentsApi.list(page),
  })

  const approveMutation = useMutation({
    mutationFn: studentsApi.approve,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['students'] }),
  })
  const rejectMutation = useMutation({
    mutationFn: studentsApi.reject,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['students'] }),
  })

  if (isLoading) return <PageSpinner />

  const filtered = (data?.data ?? []).filter((s) =>
    search === '' ||
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Alunas</h1>
          <p className="text-gray-500 text-sm mt-1">{data?.total ?? 0} alunas cadastradas</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          className="input pl-9"
          placeholder="Buscar por nome ou e-mail…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <Card padding="md" className="text-center text-gray-400 py-12">
          Nenhuma aluna encontrada.
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((student: Student) => {
            const status = STATUS_MAP[student.status]
            return (
              <Card key={student.id} padding="md" className="flex items-center gap-4">
                <div className="h-10 w-10 shrink-0 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">
                  {student.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{student.name}</span>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </div>
                  <p className="text-sm text-gray-500 truncate">{student.email}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {student.status === 'pending' && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-green-600 hover:bg-green-50"
                        loading={approveMutation.isPending && approveMutation.variables === student.id}
                        onClick={() => approveMutation.mutate(student.id)}
                      >
                        <UserCheck className="h-4 w-4" /> Aprovar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:bg-red-50"
                        loading={rejectMutation.isPending && rejectMutation.variables === student.id}
                        onClick={() => rejectMutation.mutate(student.id)}
                      >
                        <UserX className="h-4 w-4" /> Rejeitar
                      </Button>
                    </>
                  )}
                  <Link to={`/trainer/students/${student.id}`}>
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
    </div>
  )
}
