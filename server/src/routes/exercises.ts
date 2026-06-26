import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import * as exercisesController from '../controllers/exercises'

const router = Router()
router.use(requireAuth)
router.get('/', exercisesController.getExercises)
router.post('/', exercisesController.saveExercises)

export default router
