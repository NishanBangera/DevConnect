import { Router } from 'express';
import authRoutes from './auth.route.js';
import userRoutes from './user.route.js';
// import requestRoutes from './request.route.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/user', userRoutes);
// router.use('/request', requestRoutes);

export default router;
