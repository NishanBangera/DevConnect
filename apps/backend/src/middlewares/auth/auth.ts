import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../../models/user.model.js";
import { DecodedUser, AuthenticatedRequest } from "../../types/auth.types.js";

export const userAuth = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    // Check Authorization header first, then cookie
    const token = req.header("Authorization")?.replace("Bearer ", "")
    if (!token) {
        return res.status(401).send('Access Denied: No Token Provided!');
    }
    try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || 'default_secret') as DecodedUser;
        if (decoded && decoded.userId) {
            const user = await User.findById(decoded.userId).select('-password -refreshTokens');
            if (!user) {
                return res.status(401).send('Access Denied: User Not Found');
            }
            req.userId = user._id as string;
            next();
        } else {
            res.status(401).send('Access Denied: Invalid Token');
        }
    } catch (err) {
        res.status(400).send('Invalid Token');
    }
};