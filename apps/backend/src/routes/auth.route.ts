import { Router } from "express";
import { loginUser, registerUser, refreshToken, logout, forgotPassword, resetPassword } from "../controllers/auth.controller.js";
import { handleValidationErrors } from "../middlewares/validators/error.validator.js";
import { loginValidators, registerValidators, forgotPasswordValidators, resetPasswordValidators } from "../middlewares/validators/auth.validator.js";

const authRoutes = Router();

// Public auth routes - these do not require an authenticated user
authRoutes.post("/register", registerValidators, handleValidationErrors, registerUser);
authRoutes.post("/login", loginValidators, handleValidationErrors, loginUser);

authRoutes.post('/refresh', refreshToken);
authRoutes.post('/logout', logout);

authRoutes.post('/forgot-password', forgotPasswordValidators, handleValidationErrors, forgotPassword);
authRoutes.post('/reset-password', resetPasswordValidators, handleValidationErrors, resetPassword);

export default authRoutes;
