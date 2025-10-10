import { Request, Response } from "express";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import User, { IUser } from "../models/user.model.js";

// exported above

export const getUserProfile = asyncHandler(async (req: Request, res: Response) => {
    // `userAuth` middleware attaches the user document to req.user
    const userDoc = (req as any).user as IUser | null;
    if (!userDoc) return res.status(401).send('Unauthorized');

    // Re-fetch to ensure latest data and to exclude sensitive fields
    const user = await User.findById(userDoc._id).select('-password -refreshTokens');
    if (!user) return res.status(404).send('User not found');

    return res.status(200).send(new ApiResponse(200, user, 'User profile fetched'));
});