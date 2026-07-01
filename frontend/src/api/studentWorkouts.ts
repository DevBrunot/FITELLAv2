import { api } from './client'
import type { Workout, WorkoutExecution, Paginated } from '@/types'

export const studentWorkoutsApi = {
  list: (page = 1, limit = 20) =>
    api.get<Paginated<Workout>>('/student/workouts', { params: { page, limit } }).then((r) => r.data),

  get: (id: string) =>
    api.get<Workout>(`/student/workouts/${id}`).then((r) => r.data),

  start: (id: string) =>
    api.post<WorkoutExecution>(`/student/workouts/${id}/start`).then((r) => r.data),

  finish: (id: string, executionId?: string) =>
    api.post<WorkoutExecution>(`/student/workouts/${id}/finish`, { executionId }).then((r) => r.data),

  getCompleted: (page = 1, limit = 20) =>
    api.get<Paginated<WorkoutExecution>>('/student/workouts/completed', { params: { page, limit } }).then((r) => r.data),
}

export const feedbackApi = {
  submit: (workoutId: string, data: { rating: number; comment?: string; effort?: string; painOrDiscomfort?: string }) =>
    api.post(`/workouts/${workoutId}/feedback`, data).then((r) => r.data),
}
