import { Response } from "express";
import ConnectionRequest from "../models/request.model.js";
import { AuthenticatedRequest } from "../types/auth.types.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createRequest = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const requester = req.userId;
    const { recipientId, status } = req.params;

    const newRequest = await ConnectionRequest.create({
        requester,
        recipient: recipientId,
        status
    });

    return res.status(201).json(new ApiResponse(201, newRequest, 'Connection request ignored or created successfully'));
});

export const reviewRequest = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { requestId, status } = req.params;

    // validator ensures request exists, belongs to recipient and is reviewable
    const updated = await ConnectionRequest.findByIdAndUpdate(
        requestId,
        { status },
        { new: true, runValidators: true }
    );

    return res.status(200).json(new ApiResponse(200, updated, 'Connection request reviewed successfully'));
});
