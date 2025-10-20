import { model, Schema } from "mongoose";
import { IConnectionRequest } from "../types/request.types.js";

const connectionRequestSchema = new Schema<IConnectionRequest>({
  requester: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: { values: ['interested', 'ignored', 'accepted', 'rejected'], message: '{VALUE} is not a valid status' }, required: true },
}, { timestamps: true });

connectionRequestSchema.index({ requester: 1, recipient: 1 }, { unique: true });

const ConnectionRequest = model<IConnectionRequest>("ConnectionRequest", connectionRequestSchema);
export default ConnectionRequest;