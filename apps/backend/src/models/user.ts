import { Schema, model } from "mongoose";

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
}, { timestamps: true });

const User = model("User", userSchema);

export default User;
