import mongoose from "mongoose";
import { Schema } from "mongoose";
import { CloudinaryFile } from "../types/types";

export interface UserInterface {
  email: string;
  username: string;
  token: string;
  hash: string;
  salt: String;
  avatar?: CloudinaryFile;
}

const userSchema = new Schema<UserInterface>({
  email: { type: String, required: true },
  username: { type: String, required: true },
  token: { type: String, required: true },
  hash: { type: String, required: true },
  salt: { type: String, required: true },
  avatar: { type: Object, required: false },
});
export const User = mongoose.model("User", userSchema);
