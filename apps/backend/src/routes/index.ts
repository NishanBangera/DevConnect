import { Router } from 'express';
import authRoutes from './auth.route.js';
import userRoutes from './user.route.js';

const router = Router();

// Mount public auth-related routes under /auth
router.use('/auth', authRoutes);

// Mount user-related routes under /user (these routes themselves apply auth middleware where needed)
router.use('/user', userRoutes);

export default router;
