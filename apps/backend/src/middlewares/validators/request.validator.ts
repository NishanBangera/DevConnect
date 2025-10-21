import { param } from "express-validator";
import User from "../../models/user.model.js";
import ConnectionRequest from "../../models/request.model.js";


export const createRequestValidator = [
    // status must be either 'interested' or 'ignored'
    param("status")
        .exists().withMessage("status is required")
        .isString().withMessage("status must be a string")
        .trim()
        .isIn(["interested", "ignored"]).withMessage("status must be either 'interested' or 'ignored'"),

    // recipientId must be a valid MongoDB ObjectId
    param("recipientId")
        .exists().withMessage("recipientId is required")
        .isMongoId().withMessage("recipientId must be a valid MongoDB ObjectId")
        .custom(async (recipientId, { req }) => {
            const requesterId = req.userId;

            if (String(recipientId) === String(requesterId)) {
                throw new Error('Cannot send connection request to yourself');
            }

            // Check if recipient exists
            const recipientExists = await User.findById(recipientId);
            if (!recipientExists) {
                throw new Error('Recipient not found');
            }

            // Check if connection request already exists
            if (requesterId) {
                const existingRequest = await ConnectionRequest.findOne({
                    $or: [
                        { requester: requesterId, recipient: recipientId },
                        { requester: recipientId, recipient: requesterId }
                    ]
                });

                if (existingRequest) {
                    throw new Error('Connection request already exists');
                }
            }

            return true;
        }),
];

export const reviewRequestValidator = [
    // status must be either 'accepted' or 'rejected'
    param("status")
        .exists().withMessage("status is required")
        .isString().withMessage("status must be a string")
        .trim()
        .isIn(["accepted", "rejected"]).withMessage("status must be either 'accepted' or 'rejected'"),

    // requestId must be a valid MongoDB ObjectId and refer to an existing request
    param("requestId")
        .exists().withMessage("requestId is required")
        .isMongoId().withMessage("requestId must be a valid MongoDB ObjectId")
        .custom(async (requestId, { req }) => {
            const userId = req.userId;

            const request = await ConnectionRequest.findById(requestId);
            if (!request) {
                throw new Error('Connection request not found');
            }

            // Only the recipient can review the request
            if (String(request.recipient) !== String(userId)) {
                throw new Error('Not authorized to review this request');
            }

            // Cannot review if the status is not 'interested'
            if (request.status !== 'interested') {
                throw new Error('Connection request is not in a reviewable state');
            }

            return true;
        }),
];