import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchProfile, updateProfile } from '@/services/profile'
import type { Profile } from '@/types'

export function useProfile() {
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
    retry: false,
  })

  const queryClient = useQueryClient()

  const { mutateAsync: saveProfile, isPending: isSaving } = useMutation({
    mutationFn: (updates: Partial<Profile>) => updateProfile(updates),
    onSuccess: (updated) => {
      queryClient.setQueryData(['profile'], updated)
    },
  })

  return { profile, isLoading, saveProfile, isSaving }
}
