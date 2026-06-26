import { Router } from 'express'
import workoutRoutes from './workouts'
import profileRoutes from './profile'
import aiRoutes from './ai'
import exerciseRoutes from './exercises'
import workoutLogRoutes from './workoutLog'

const router = Router()

router.use('/workouts', workoutRoutes)
router.use('/profile', profileRoutes)
router.use('/ai', aiRoutes)
router.use('/exercises', exerciseRoutes)
router.use('/workout-logs', workoutLogRoutes)

export default router
