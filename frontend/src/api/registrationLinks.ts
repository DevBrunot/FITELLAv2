import { api } from './client'
import type { RegistrationLink, Paginated } from '@/types'

export const registrationLinksApi = {
  list: (page = 1, limit = 20) =>
    api.get<Paginated<RegistrationLink>>('/registration-links', { params: { page, limit } }).then((r) => r.data),

  create: (data: { linkType?: 'permanent' | 'expirable'; expiresInDays?: number }) =>
    api.post<RegistrationLink>('/registration-links', data).then((r) => r.data),

  delete: (id: string) =>
    api.delete(`/registration-links/${id}`),
}
