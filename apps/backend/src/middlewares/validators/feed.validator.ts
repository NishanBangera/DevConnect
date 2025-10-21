import { query } from "express-validator";

// Validators for fetching user feeds (pagination)
export const getFeedsValidators = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be an integer greater than or equal to 1')
        .toInt(),

    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be an integer between 1 and 100')
        .toInt(),
];
