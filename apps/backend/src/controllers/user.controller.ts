import { Request, Response } from "express";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import User, { IUser } from "../models/user.model.js";

export const getUserProfile = asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user as IUser
    return res.status(200).json(new ApiResponse(200, user, 'User profile fetched'));
});

export const updateUserProfile = asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user as IUser

    const { firstName, lastName, email, age, gender } = req.body;

    const updateData: Partial<IUser> = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (email !== undefined) updateData.email = email;
    if (age !== undefined) updateData.age = age;
    if (gender !== undefined) updateData.gender = gender;

    if (updateData.email && updateData.email !== user.email) {
        const normalizedEmail = (updateData.email as string).toLowerCase().trim();
        updateData.email = normalizedEmail as any;

        const existing = await User.findOne({ email: normalizedEmail, _id: { $ne: user._id } });
        if (existing) {
            return res.status(409).json(new ApiResponse(409, null, 'Email is already in use by another account'));
        }
    }

    const updatedUser = await User.findByIdAndUpdate(user._id, updateData, { new: true, runValidators: true }).select('-password -refreshTokens');
    if (!updatedUser) return res.status(404).json(new ApiResponse(404, null, 'User not found'));

    return res.status(200).json(new ApiResponse(200, updatedUser, 'User profile updated successfully'));
});

export const updateUserPassword = asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user as IUser;
    const { currentPassword, newPassword } = req.body;

    const fullUser = await User.findById(user._id) as IUser | null;
    if (!fullUser) return res.status(404).json(new ApiResponse(404, null, 'User not found'));

    const isMatch = await fullUser.isPasswordCorrect(currentPassword);
    if (!isMatch) return res.status(400).json(new ApiResponse(400, null, 'Current password is incorrect'));

    fullUser.password = newPassword;
    await fullUser.save();

    return res.status(200).json(new ApiResponse(200, null, 'Password updated successfully'));
});
