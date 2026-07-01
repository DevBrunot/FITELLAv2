import { api } from './client'
import type { Workout, Paginated } from '@/types'

export interface WorkoutExerciseDto {
  exerciseId: string
  sets?: number
  useTime?: boolean
  reps?: number
  timeOn?: number
  restSeconds?: number
  notes?: string
  order?: number
}

export interface CreateWorkoutDto {
  title: string
  description?: string
  type: string
  isTemplate?: boolean
  exercises?: WorkoutExerciseDto[]
}

export const workoutsApi = {
  list: (page = 1, limit = 20) =>
    api.get<Paginated<Workout>>('/workouts', { params: { page, limit } }).then((r) => r.data),

  get: (id: string) =>
    api.get<Workout>(`/workouts/${id}`).then((r) => r.data),

  create: (data: CreateWorkoutDto) =>
    api.post<Workout>('/workouts', data).then((r) => r.data),

  update: (id: string, data: Partial<CreateWorkoutDto>) =>
    api.patch<Workout>(`/workouts/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    api.delete(`/workouts/${id}`),

  saveAsTemplate: (id: string) =>
    api.post<Workout>(`/workouts/${id}/save-template`).then((r) => r.data),

  send: (id: string, studentIds: string[]) =>
    api.post<{ sentAt: string; count: number }>(`/workouts/${id}/send`, { studentIds }).then((r) => r.data),

  getFeedbacks: (workoutId: string, page = 1, limit = 20) =>
    api.get(`/workouts/${workoutId}/feedback`, { params: { page, limit } }).then((r) => r.data),
}
