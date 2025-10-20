import { Response } from "express";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/user.model.js";
import { AuthenticatedRequest } from "../types/auth.types.js";

export const getUserProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = await User.findById(req.userId).select('-password -refreshTokens');
    if (!user) {
        return res.status(404).json(new ApiResponse(404, null, 'User not found'));
    }
    return res.status(200).json(new ApiResponse(200, user, 'User profile fetched'));
});

export const updateUserProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.userId;
    const { firstName, lastName, email, age, gender } = req.body;

    const updateData: any = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (email !== undefined) updateData.email = email.toLowerCase().trim();
    if (age !== undefined) updateData.age = age;
    if (gender !== undefined) updateData.gender = gender;

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true }).select('-password -refreshTokens');
    if (!updatedUser) return res.status(404).json(new ApiResponse(404, null, 'User not found'));

    return res.status(200).json(new ApiResponse(200, updatedUser, 'User profile updated successfully'));
});

export const updateUserPassword = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.userId;
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json(new ApiResponse(404, null, 'User not found'));

    const isMatch = await user.isPasswordCorrect(currentPassword);
    if (!isMatch) return res.status(400).json(new ApiResponse(400, null, 'Current password is incorrect'));

    user.password = newPassword;
    await user.save();

    return res.status(200).json(new ApiResponse(200, null, 'Password updated successfully'));
});


