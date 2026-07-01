import { api } from './client'
import type { Exercise, Paginated } from '@/types'

export interface CreateExerciseDto {
  name: string
  description?: string
  youtubeUrl?: string
  videoUrl?: string
  category: string
  postPartumOnly?: boolean
}

export const exercisesApi = {
  list: (page = 1, limit = 20) =>
    api.get<Paginated<Exercise>>('/exercises', { params: { page, limit } }).then((r) => r.data),

  get: (id: string) =>
    api.get<Exercise>(`/exercises/${id}`).then((r) => r.data),

  create: (data: CreateExerciseDto) =>
    api.post<Exercise>('/exercises', data).then((r) => r.data),

  update: (id: string, data: Partial<CreateExerciseDto>) =>
    api.patch<Exercise>(`/exercises/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    api.delete(`/exercises/${id}`),
}
