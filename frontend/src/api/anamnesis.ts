import { api } from './client'
import type { Anamnesis } from '@/types'

export interface CreateAnamnesisDto {
  gestationalWeeks?: number
  dueDate?: string
  isPostPartum?: boolean
  weeksPostPartum?: number
  hasPreviousExerciseHistory?: boolean
  medicalRestrictions?: string
  healthObservations?: string
  doctorName?: string
  doctorPhone?: string
  lgpdConsent: true
}

export const anamnesisApi = {
  create: (data: CreateAnamnesisDto) =>
    api.post<Anamnesis>('/anamnesis', data).then((r) => r.data),

  getMe: () =>
    api.get<Anamnesis | null>('/anamnesis/me').then((r) => r.data),

  updateMe: (data: Partial<Omit<CreateAnamnesisDto, 'lgpdConsent'>>) =>
    api.patch<Anamnesis>('/anamnesis/me', data).then((r) => r.data),
}
