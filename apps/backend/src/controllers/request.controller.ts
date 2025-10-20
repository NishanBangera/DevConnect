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