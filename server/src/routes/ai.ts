import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import * as aiController from '../controllers/ai'

const router = Router()

router.use(requireAuth)

router.post('/chat', aiController.chat)
router.get('/history', aiController.getHistory)
router.post('/workout-coach', aiController.workoutCoach)

export default router
