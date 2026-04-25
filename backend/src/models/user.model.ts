import mongoose, { type Document, Schema } from "mongoose";

export interface ISocial {
  platform: string;
  url: string;
}

export interface IUser extends Document {
  address: string;
  avatar: string;
  banner: string;
  username: string;
  email: string;
  bio: string;
  socials: ISocial[];
}

const UserSchema = new Schema<IUser>(
  {
    address: { type: String, required: true, unique: true },
    avatar: { type: String, default: "" },
    banner: { type: String, default: "" },
    username: { type: String, default: "" },
    email: { type: String, default: "" },
    bio: { type: String, default: "" },
    socials: { type: [{ platform: { type: String }, url: { type: String } }], default: [] },
  },
  { timestamps: true },
);

const User = mongoose.model<IUser>("User", UserSchema);
export default User;
