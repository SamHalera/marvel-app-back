import mongoose from "mongoose";
import { Schema } from "mongoose";
import { UserInterface } from "./User";

interface FavoriteInterface {
  label: string;
  itemId: string;
  user: UserInterface;
}

const FavoriteSchema = new Schema<FavoriteInterface>({
  label: { type: String, required: true },
  itemId: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

export const Favorite = mongoose.model("Favorite", FavoriteSchema);
