import { Document } from "mongoose";

export interface IUser extends Document {
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
  age?: number;
  gender?: string;
  photoUrl?: string;
  description?: string;
  skills?: string[];
  refreshTokens?: { tokenHash: string; expiresAt: Date }[];
  passwordResetToken?: string;
  passwordResetExpires?: Date;

  isPasswordCorrect(password: string): Promise<boolean>;
  generateAccessToken(): string;
  generateRefreshToken(): string;
}
