import api from '@/lib/api'
import type { Profile } from '@/types'

export async function fetchProfile(): Promise<Profile> {
  const { data } = await api.get<Profile>('/profile')
  return data
}

export async function updateProfile(updates: Partial<Profile>): Promise<Profile> {
  const { data } = await api.patch<Profile>('/profile', updates)
  return data
}
