import { api } from '@/lib/apiClient'

export interface Session {
  id: string
  email: string
  firstName: string
  lastName: string
  isAdmin: boolean
}

export interface Credentials {
  email: string
  password: string
}

export const authApi = {
  me: (signal?: AbortSignal) => api.get<Session>('/auth/me', signal),
  login: (credentials: Credentials) => api.post<void>('/auth/login?useCookies=true', credentials),
  register: (credentials: Credentials) => api.post<void>('/auth/register', credentials),
  logout: () => api.post<void>('/auth/logout'),
  forgotPassword: (email: string) => api.post<void>('/auth/forgotPassword', { email }),
  resetPassword: (email: string, resetCode: string, newPassword: string) => api.post<void>('/auth/resetPassword', { email, resetCode, newPassword }),
  changePassword: (oldPassword: string, newPassword: string) => api.post<unknown>('/auth/manage/info', { oldPassword, newPassword }),
}
