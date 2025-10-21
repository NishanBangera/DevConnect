import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { ApiResponse } from "../../utils/apiResponse.js";

// middleware to handle validation results
export const handleValidationErrors = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(err => err.msg).join(', ');
        return res.status(400).json(new ApiResponse(400, null, errorMessages));
    }
    next();
};
