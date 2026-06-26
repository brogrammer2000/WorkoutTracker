import { Router } from 'express'
import workoutRoutes from './workouts'

const router = Router()

router.use('/workouts', workoutRoutes)

export default router
