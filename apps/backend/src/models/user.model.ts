import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Schema, model, Document } from "mongoose";

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

  isPasswordCorrect(password: string): Promise<boolean>;
  generateAccessToken(): string;
  generateRefreshToken(): string;
}

const userSchema = new Schema({
  firstName: { type: String, minLength: 4, required: true },
  lastName: { type: String },
  email: { type: String, lowercase: true, trim: true, required: true, unique: true },
  password: { type: String, required: true },
  age: { type: Number, min: 13 },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  photoUrl: { type: String },
  description: { type: String },
  skills: { type: [String], default: [] },
  refreshTokens: { type: [{ tokenHash: String, expiresAt: Date }], default: [] }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if(!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function(password: string){
  return bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = function() {
  return jwt.sign({ userId: this._id }, process.env.ACCESS_TOKEN_SECRET || 'default_secret', { expiresIn: '15m' });
};

userSchema.methods.generateRefreshToken = function() {
  return jwt.sign({ userId: this._id }, process.env.REFRESH_TOKEN_SECRET || 'default_secret', { expiresIn: '14d' });
};

const User = model<IUser>("User", userSchema);

export default User;

