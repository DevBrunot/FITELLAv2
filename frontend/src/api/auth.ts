import { api } from './client'
import type { AuthResponse } from '@/types'

export const authApi = {
  trainerRegister: (data: { email: string; password: string; name: string; phone?: string }) =>
    api.post<AuthResponse>('/auth/register', data).then((r) => r.data),

  trainerLogin: (data: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', data).then((r) => r.data),

  studentRegister: (data: { email: string; password: string; name: string; phone?: string; registrationCode: string }) =>
    api.post<AuthResponse>('/auth/student/register', data).then((r) => r.data),

  studentLogin: (data: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/student/login', data).then((r) => r.data),
}
