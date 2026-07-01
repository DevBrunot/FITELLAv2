import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell, CheckCheck } from 'lucide-react'
import { notificationsApi } from '@/api/notifications'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { PageSpinner } from '@/components/ui/Spinner'
import { cn } from '@/utils/cn'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function StudentNotifications() {
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', 1],
    queryFn: () => notificationsApi.list(1, 50),
  })

  const markReadMutation = useMutation({
    mutationFn: notificationsApi.markRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })
  const markAllMutation = useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })

  if (isLoading) return <PageSpinner />

  const unreadCount = data?.data.filter((n) => !n.isRead).length ?? 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Notificações</h1>
          {unreadCount > 0 && <p className="text-sm text-rose-500 mt-1">{unreadCount} não lidas</p>}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="secondary"
            size="sm"
            loading={markAllMutation.isPending}
            onClick={() => markAllMutation.mutate()}
            className="gap-2"
          >
            <CheckCheck className="h-4 w-4" /> Marcar todas como lidas
          </Button>
        )}
      </div>

      {!data?.data.length ? (
        <Card padding="md" className="text-center py-12 text-gray-400">
          <Bell className="h-10 w-10 mx-auto mb-3 text-gray-300" />
          Nenhuma notificação ainda.
        </Card>
      ) : (
        <div className="space-y-2">
          {data.data.map((notif) => (
            <Card
              key={notif.id}
              padding="md"
              className={cn(
                'flex items-start gap-3 cursor-pointer transition-colors',
                !notif.isRead && 'border-rose-200 bg-rose-50/50'
              )}
              onClick={() => !notif.isRead && markReadMutation.mutate(notif.id)}
            >
              <div className={cn(
                'mt-0.5 h-2 w-2 shrink-0 rounded-full',
                notif.isRead ? 'bg-gray-200' : 'bg-rose-500'
              )} />
              <div className="flex-1 min-w-0">
                <p className={cn('text-sm font-medium', notif.isRead ? 'text-gray-700' : 'text-gray-900')}>
                  {notif.title}
                </p>
                <p className="text-sm text-gray-500 mt-0.5">{notif.body}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {format(new Date(notif.createdAt), "d 'de' MMM 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
