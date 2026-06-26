import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import * as ctrl from '../controllers/workoutLog'

const router = Router()
router.use(requireAuth)

router.get('/', ctrl.getLog)
router.get('/dates', ctrl.getLoggedDates)
router.post('/', ctrl.createLog)
router.post('/:logId/sets', ctrl.saveSets)
router.post('/history', ctrl.getExerciseHistory)

export default router
