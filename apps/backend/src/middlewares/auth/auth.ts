import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Document } from "mongoose";
import User from "../../models/user.model.js";

interface DecodedUser {
    userId: string;
}

interface AuthenticatedRequest extends Request {
    user?: DecodedUser | Document;
}

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
            req.user = user;
            next();
        } else {
            res.status(401).send('Access Denied: Invalid Token');
        }
    } catch (err) {
        res.status(400).send('Invalid Token');
    }
};