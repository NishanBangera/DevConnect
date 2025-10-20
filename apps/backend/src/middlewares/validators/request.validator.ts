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
            if (recipientId.equals(requesterId)) {
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