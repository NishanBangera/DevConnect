import { Router } from "express";
import { getUserProfile, updateUserProfile, updateUserPassword, getConnectionRequests, getConnections, getUserFeeds } from "../controllers/user.controller.js";
import { userAuth } from "../middlewares/auth/auth.js";
import { updateUserProfileValidators } from "../middlewares/validators/user.validator.js";
import { updatePasswordValidators } from "../middlewares/validators/user.validator.js";
import { handleValidationErrors } from "../middlewares/validators/error.validator.js";
import { getFeedsValidators } from "../middlewares/validators/feed.validator.js";

const userRoutes = Router();

userRoutes.get('/profile/view', userAuth, getUserProfile);
userRoutes.patch('/profile/update', userAuth, updateUserProfileValidators, handleValidationErrors, updateUserProfile);
userRoutes.patch('/profile/password/update', userAuth, updatePasswordValidators, handleValidationErrors, updateUserPassword);

userRoutes.get('/requests/received', userAuth, getConnectionRequests);
userRoutes.get('/connections', userAuth, getConnections);
userRoutes.get('/feeds', userAuth, getFeedsValidators, handleValidationErrors, getUserFeeds);

export default userRoutes;