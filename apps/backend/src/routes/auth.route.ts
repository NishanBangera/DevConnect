import { Router } from "express";
import { loginUser, registerUser, refreshToken, logout } from "../controllers/auth.controller.js";
import { handleValidationErrors } from "../middlewares/validators/validator.js";
import { loginValidators, registerValidators } from "../middlewares/validators/auth.validator.js";

const authRoutes = Router();

authRoutes.post("/register", registerValidators, handleValidationErrors, registerUser);
authRoutes.post("/login", loginValidators, handleValidationErrors, loginUser);
authRoutes.post('/refresh', refreshToken);
authRoutes.post('/logout', logout);

export default authRoutes;
