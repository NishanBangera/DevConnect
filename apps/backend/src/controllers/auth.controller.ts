import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/user.model.js";
import { IUser, LoginResponse } from "../types/index.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";

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

    const user = new User({ firstName, lastName, email, password, age, gender });
    await user.save();

    const createdUser = await User.findById(user._id).select('-password -refreshTokens');
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    return res.status(201).json(new ApiResponse(201, createdUser, "User registered successfully"));
});

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }) as IUser | null;
    if (!user) throw new ApiError(400, 'Invalid email or password');

    const isMatch = await user.isPasswordCorrect(password);
    if (!isMatch) throw new ApiError(400, 'Invalid email or password');

    // generate tokens and set cookie
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user);
    res.cookie('refreshToken', refreshToken, cookieOptions);
    return res.status(200).json(new ApiResponse(200, { accessToken } as LoginResponse, 'Login successful'));
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.cookies;
    if (!refreshToken) return res.status(401).json(new ApiResponse(401, null, 'No refresh token'));

    // Verify signature
    let decoded: any;
    try {
        decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || 'default_secret');
    } catch (err) {
        return res.status(401).json(new ApiResponse(401, null, 'Invalid refresh token'));
    }

    const user = await User.findById(decoded.userId) as IUser | null;
    if (!user) return res.status(401).json(new ApiResponse(401, null, 'User not found'));

    const incomingHash = hashToken(refreshToken);
    // Find matching stored token
    const stored = ((user.refreshTokens as any) || []).find((t: any) => t.tokenHash === incomingHash);
    if (!stored) {
        // Token reuse detected or token not present
        user.refreshTokens = [] as any;
        await user.save();
        return res.status(401).json(new ApiResponse(401, null, 'Refresh token revoked'));
    }

    // Check expiry
    if (stored.expiresAt && new Date(stored.expiresAt) < new Date()) {
        // Remove expired token
        user.refreshTokens = ((user.refreshTokens as any) || []).filter((t: any) => t.tokenHash !== incomingHash) as any;
        await user.save();
        return res.status(401).json(new ApiResponse(401, null, 'Refresh token expired'));
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

    return res
        .cookie('refreshToken', newRefreshToken, cookieOptions)
        .status(200)
        .json(new ApiResponse(200, { accessToken }, 'Token refreshed'));
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
    return res.status(200).json(new ApiResponse(200, { success: true }, 'Logged out'));
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;

    const user = await User.findOne({ email }) as IUser | null;
    // Do not reveal whether the email exists. If it exists, store a reset token.
    if (!user) {
        return res.status(200).json(new ApiResponse(200, null, 'If that email exists, a password reset link has been sent'));
    }

    // generate reset token (plain) and store its hash on the user with expiry
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = hashToken(resetToken);
    const expiresAt = new Date(Date.now() + (Number(process.env.PASSWORD_RESET_TOKEN_EXPIRY_MS) || 60 * 60 * 1000)); // 1 hour default

    // store hashed token and expiry
    (user as any).passwordResetToken = resetTokenHash;
    (user as any).passwordResetExpires = expiresAt;
    await user.save({ validateBeforeSave: false });

    // In production you would email the reset URL to the user. Since no mailer exists in the project,
    // return a generic success message. For development (non-production) return the raw token so it can be used.
    const devData = process.env.NODE_ENV !== 'production' ? { resetToken } : null;

    return res.status(200).json(new ApiResponse(200, devData, 'If that email exists, a password reset link has been sent'));
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json(new ApiResponse(400, null, 'Token and new password are required'));

    const tokenHash = hashToken(token);
    const user = await User.findOne({ passwordResetToken: tokenHash, passwordResetExpires: { $gt: new Date() } }) as IUser | null;
    if (!user) return res.status(400).json(new ApiResponse(400, null, 'Invalid or expired token'));

    // update password and clear reset fields and refresh tokens
    user.password = newPassword as any;
    (user as any).passwordResetToken = undefined;
    (user as any).passwordResetExpires = undefined;
    user.refreshTokens = [] as any;
    await user.save();

    return res.status(200).json(new ApiResponse(200, null, 'Password has been reset successfully'));
});
