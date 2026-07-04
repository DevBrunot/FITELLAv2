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
      <div className="page-header">
        <div>
          <h1 className="page-title">Notificações</h1>
          {unreadCount > 0 && <p className="text-sm text-primary mt-1">{unreadCount} não lidas</p>}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="secondary"
            size="sm"
            loading={markAllMutation.isPending}
            onClick={() => markAllMutation.mutate()}
            className="gap-2 w-full sm:w-auto"
          >
            <CheckCheck className="h-4 w-4" /> Marcar todas como lidas
          </Button>
        )}
      </div>

      {!data?.data.length ? (
        <Card padding="md" className="text-center py-12 text-muted-foreground">
          <Bell className="h-10 w-10 mx-auto mb-3 text-muted" strokeWidth={1.5} />
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
                !notif.isRead && 'border-primary/30 bg-accent'
              )}
              onClick={() => !notif.isRead && markReadMutation.mutate(notif.id)}
            >
              <div className={cn(
                'mt-0.5 h-2 w-2 shrink-0 rounded-full',
                notif.isRead ? 'bg-muted' : 'bg-primary'
              )} />
              <div className="flex-1 min-w-0">
                <p className={cn('text-sm font-medium', notif.isRead ? 'text-muted-foreground' : 'text-foreground')}>
                  {notif.title}
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">{notif.body}</p>
                <p className="text-xs text-muted-foreground/70 mt-1">
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
