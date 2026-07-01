import { api } from './client'
import type { Notification, Paginated } from '@/types'

export const notificationsApi = {
  list: (page = 1, limit = 20) =>
    api.get<Paginated<Notification>>('/notifications', { params: { page, limit } }).then((r) => r.data),

  markRead: (id: string) =>
    api.patch<Notification>(`/notifications/${id}/read`).then((r) => r.data),

  markAllRead: () =>
    api.patch('/notifications/read-all').then((r) => r.data),
}
