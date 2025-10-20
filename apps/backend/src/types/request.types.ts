import { Schema } from "mongoose";

export interface IConnectionRequest {
  requester: Schema.Types.ObjectId;
  recipient: Schema.Types.ObjectId;
  status: 'interested' | 'ignored' | 'accepted' | 'rejected';
}
