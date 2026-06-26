import api from '@/lib/api'
import type { Message } from '@/types'

export async function sendMessage(message: string): Promise<string> {
  const { data } = await api.post<{ message: string }>('/ai/chat', { message })
  return data.message
}

export async function fetchHistory(): Promise<Message[]> {
  const { data } = await api.get<Message[]>('/ai/history')
  return data
}
