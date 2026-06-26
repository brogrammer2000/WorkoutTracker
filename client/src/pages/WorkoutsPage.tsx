import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useProfile } from '@/hooks/useProfile'
import { fetchUserExercises, saveUserExercises } from '@/services/exercises'
import { ALL_SPLITS, type Split } from '@/data/splits'
import SplitSelectionPage from './workouts/SplitSelectionPage'
import ExerciseSelectionPage from './workouts/ExerciseSelectionPage'
import WorkoutSchedulePage from './workouts/WorkoutSchedulePage'
import TrackWorkoutPage from './workouts/TrackWorkoutPage'

type Screen = 'split' | 'exercises' | 'schedule' | 'track'

export default function WorkoutsPage() {
  const { profile, saveProfile } = useProfile()
  const queryClient = useQueryClient()

  const { data: selectedExercises = new Set<string>(), isLoading } = useQuery({
    queryKey: ['user-exercises'],
    queryFn: fetchUserExercises,
    enabled: !!profile,
  })

  const { mutateAsync: persistExercises } = useMutation({
    mutationFn: saveUserExercises,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['user-exercises'] }),
  })

  const savedSplit = profile?.workout_split
    ? ALL_SPLITS.find((s) => s.id === profile.workout_split) ?? null
    : null

  const initialScreen: Screen = !savedSplit ? 'split'
    : selectedExercises.size === 0 ? 'exercises'
    : 'schedule'

  const [screen, setScreen] = useState<Screen>(initialScreen)
  const [activeSplit, setActiveSplit] = useState<Split | null>(savedSplit)

  async function handleSplitSelect(split: Split) {
    setActiveSplit(split)
    await saveProfile({ workout_split: split.id })
    setScreen('exercises')
  }

  async function handleExercisesSave(selected: Set<string>) {
    await persistExercises(selected)
    setScreen('schedule')
  }

  if (isLoading || !profile) {
    return <div style={loading}>Loading…</div>
  }

  const days = profile.workout_days_per_week ?? 3

  return (
    <div>
      {screen === 'split' && (
        <SplitSelectionPage workoutDays={days} onSelect={handleSplitSelect} />
      )}
      {screen === 'exercises' && activeSplit && (
        <ExerciseSelectionPage
          split={activeSplit}
          initialSelected={selectedExercises}
          onSave={handleExercisesSave}
          onBack={() => setScreen('split')}
        />
      )}
      {screen === 'schedule' && activeSplit && (
        <WorkoutSchedulePage
          split={activeSplit}
          selectedExerciseIds={selectedExercises}
          onReconfigure={() => setScreen('split')}
          onTrack={() => setScreen('track')}
        />
      )}
      {screen === 'track' && activeSplit && (
        <TrackWorkoutPage
          split={activeSplit}
          selectedExerciseIds={selectedExercises}
          onBack={() => setScreen('schedule')}
        />
      )}
    </div>
  )
}

const loading: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  height: '60vh', color: '#555', fontSize: 14,
}
