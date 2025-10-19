import { Request } from "express";

export interface DecodedUser {
    userId: string;
}

export interface AuthenticatedRequest extends Request {
    userId?: string;
}

export interface LoginResponse {
    accessToken: string;
}
