import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import * as workoutsController from '../controllers/workouts'

const router = Router()

router.use(requireAuth)

router.get('/', workoutsController.list)
router.post('/', workoutsController.create)
router.get('/:id', workoutsController.getById)
router.patch('/:id', workoutsController.update)
router.delete('/:id', workoutsController.remove)

export default router
