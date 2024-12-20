import { ofetch } from 'ofetch'

export const api = ofetch.create({
  baseURL: import.meta.env.VITE_BASE_URL,
})

export type APIResponse<T> = { data: T, error: null } | { data: null, error: string }