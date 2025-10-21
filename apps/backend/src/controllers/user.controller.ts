import { Response } from "express";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/user.model.js";
import { AuthenticatedRequest } from "../types/auth.types.js";
import ConnectionRequest from "../models/request.model.js";

const safeUserFields = '-password -refreshTokens -email -passwordResetToken -passwordResetExpires';

export const getUserProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = await User.findById(req.userId).select(safeUserFields);
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

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true }).select(safeUserFields);
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

export const getConnectionRequests = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.userId;

    const requests = await ConnectionRequest.find({
        recipient: userId,
        status: 'interested'
    }).populate('requester', safeUserFields);

    return res.status(200).json(new ApiResponse(200, requests, 'Connection requests fetched successfully'));
});

export const getConnections = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.userId;

    const connections = await ConnectionRequest.find({
        $or: [{ requester: userId }, { recipient: userId }],
        status: 'accepted'
    }).populate('requester', safeUserFields)
        .populate('recipient', safeUserFields);

    const filteredConnections = connections.map(conn => {
        const requesterId = String(((conn.requester as any)?._id) ?? conn.requester);
        const otherUser = requesterId === String(userId) ? conn.recipient : conn.requester;
        return otherUser;
    });

    return res.status(200).json(new ApiResponse(200, filteredConnections, 'Connections fetched successfully'));
});

export const getUserFeeds = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.userId;

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const skip = (page - 1) * limit;

    const connections = await ConnectionRequest.find({
        $or: [{ requester: userId }, { recipient: userId }]
    }).select('requester recipient');

    const hideUsersFromFeed = new Set<string>();
    connections.forEach(conn => {
        const requesterId = String(conn.requester);
        const recipientId = String(conn.recipient);

        if (requesterId === userId) {
            hideUsersFromFeed.add(recipientId);
        } else {
            hideUsersFromFeed.add(requesterId);
        }
    });
    const feeds = await User.find({ _id: { $ne: userId, $nin: Array.from(hideUsersFromFeed) } })
        .select(safeUserFields)
        .skip(skip)
        .limit(limit);

    return res.status(200).json(new ApiResponse(200, feeds, 'User feeds fetched successfully'));
});