import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User, { IUser } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";

interface LoginResponse {
    accessToken: string;
}

const hashToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex');

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' as const : 'lax' as const,
    path: '/api/v1/user',
    maxAge: Number(process.env.REFRESH_COOKIE_MAX_AGE_MS) || 14 * 24 * 60 * 60 * 1000
};

const generateAccessAndRefreshTokens = async (user: IUser) => {
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    const newHash = hashToken(refreshToken);
    const refreshExpiresAt = new Date(Date.now() + (Number(process.env.REFRESH_COOKIE_MAX_AGE_MS) || 14 * 24 * 60 * 60 * 1000));
    user.refreshTokens = ((user.refreshTokens as any) || []).concat({ tokenHash: newHash, expiresAt: refreshExpiresAt });
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
}

export const registerUser = asyncHandler(async (req: Request, res: Response) => {
    const { firstName, lastName, email, password, age, gender } = req.body;
    const findUser = await User.findOne({ email });
    if (findUser) {
        res.status(400).send('User already exists');
        return;
    }

    const user = new User({ firstName, lastName, email, password, age, gender });
    await user.save();

    const createdUser = await User.findById(user._id).select('-password -refreshTokens');
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    res.status(201).send(new ApiResponse(201, createdUser, "User registered successfully"));
});

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email }) as IUser | null;
    if (!user) {
        res.status(400).send('Invalid email or password1');
        return;
    }
    const isMatch = await user.isPasswordCorrect(password);
    if (!isMatch) {
        res.status(400).send('Invalid email or password2');
        return;
    }

    // generate tokens and set cookie
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user);
    res.cookie('refreshToken', refreshToken, cookieOptions);
    return res.status(200).send({ accessToken } as LoginResponse);
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.cookies;
    if (!refreshToken) return res.status(401).send('No refresh token');

    // Verify signature
    let decoded: any;
    try {
        decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || 'default_secret');
    } catch (err) {
        return res.status(401).send('Invalid refresh token');
    }

    const user = await User.findById(decoded.userId) as IUser | null;
    if (!user) return res.status(401).send('User not found');

    const incomingHash = hashToken(refreshToken);
    // Find matching stored token
    const stored = ((user.refreshTokens as any) || []).find((t: any) => t.tokenHash === incomingHash);
    if (!stored) {
        // Token reuse detected or token not present
        // Revoke all refresh tokens for this user as a safety measure
        user.refreshTokens = [] as any;
        await user.save();
        return res.status(401).send('Refresh token revoked');
    }

    // Check expiry
    if (stored.expiresAt && new Date(stored.expiresAt) < new Date()) {
        // Remove expired token
        user.refreshTokens = ((user.refreshTokens as any) || []).filter((t: any) => t.tokenHash !== incomingHash) as any;
        await user.save();
        return res.status(401).send('Refresh token expired');
    }

    // Rotate: remove the used refresh token and issue a new one
    user.refreshTokens = ((user.refreshTokens as any) || []).filter((t: any) => t.tokenHash !== incomingHash) as any;

    const newRefreshToken = user.generateRefreshToken();
    const newHash = hashToken(newRefreshToken);
    const refreshExpiresAt = new Date(Date.now() + (Number(process.env.REFRESH_COOKIE_MAX_AGE_MS) || 14 * 24 * 60 * 60 * 1000));
    user.refreshTokens = (user.refreshTokens || []).concat({ tokenHash: newHash, expiresAt: refreshExpiresAt });
    await user.save();

    // Issue new access token
    const accessToken = user.generateAccessToken();

    res
        .cookie('refreshToken', newRefreshToken, cookieOptions)
        .status(200)
        .send({ accessToken });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.cookies;
    if (refreshToken) {
        const decoded: any = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || 'default_secret');
        const user = await User.findById(decoded.userId);
        if (user) {
            const incomingHash = hashToken(refreshToken);
            user.refreshTokens = ((user.refreshTokens as any) || []).filter((t: any) => t.tokenHash !== incomingHash) as any;
            await user.save();
        }

    }
    // Clear cookie using same options so it is correctly removed
    res.clearCookie('refreshToken', cookieOptions);
    return res.status(200).send({ success: true });
});
