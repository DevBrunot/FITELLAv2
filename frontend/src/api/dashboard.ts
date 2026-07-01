import { api } from './client'
import type { DashboardMetrics, WorkoutFeedback } from '@/types'

export const dashboardApi = {
  getMetrics: () =>
    api.get<DashboardMetrics>('/dashboard/metrics').then((r) => r.data),

  getRecentFeedbacks: () =>
    api.get<WorkoutFeedback[]>('/dashboard/feedbacks').then((r) => r.data),
}
