import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import * as profileController from '../controllers/profile'

const router = Router()

router.use(requireAuth)

router.get('/', profileController.getProfile)
router.patch('/', profileController.updateProfile)

export default router
