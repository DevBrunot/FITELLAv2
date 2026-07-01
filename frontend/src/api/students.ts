import { api } from './client'
import type { Student, Anamnesis, Paginated } from '@/types'

export const studentsApi = {
  list: (page = 1, limit = 20) =>
    api.get<Paginated<Student>>('/students', { params: { page, limit } }).then((r) => r.data),

  get: (id: string) =>
    api.get<Student>(`/students/${id}`).then((r) => r.data),

  getAnamnesis: (id: string) =>
    api.get<Anamnesis | null>(`/students/${id}/anamnesis`).then((r) => r.data),

  getWorkouts: (id: string, page = 1, limit = 20) =>
    api.get(`/students/${id}/workouts`, { params: { page, limit } }).then((r) => r.data),

  approve: (id: string) =>
    api.patch<Student>(`/students/${id}/approve`).then((r) => r.data),

  reject: (id: string) =>
    api.patch<Student>(`/students/${id}/reject`).then((r) => r.data),
}
