import { Router } from "express";
import { getUserProfile } from "../controllers/user.controller.js";
import { userAuth } from "../middlewares/auth/auth.js";

const userRoutes = Router();

userRoutes.get('/me', userAuth, getUserProfile);

export default userRoutes;