import { Router } from "express";
import { getUserProfile, updateUserProfile, updateUserPassword } from "../controllers/user.controller.js";
import { userAuth } from "../middlewares/auth/auth.js";
import { updateUserProfileValidators } from "../middlewares/validators/user.validator.js";
import { updatePasswordValidators } from "../middlewares/validators/user.validator.js";
import { handleValidationErrors } from "../middlewares/validators/validator.js";

const userRoutes = Router();

userRoutes.get('/profile/view', userAuth, getUserProfile);
userRoutes.patch('/profile/update', userAuth, updateUserProfileValidators, handleValidationErrors, updateUserProfile);
userRoutes.patch('/profile/password/update', userAuth, updatePasswordValidators, handleValidationErrors, updateUserPassword);

export default userRoutes;