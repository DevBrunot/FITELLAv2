import axios from 'axios'
import { apiUrl } from '@/config/api'

export const api = axios.create({
  baseURL: apiUrl,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fitela:token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('fitela:token')
      localStorage.removeItem('fitela:role')
      localStorage.removeItem('fitela:user')
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)
