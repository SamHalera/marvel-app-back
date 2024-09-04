"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Favorite = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_2 = require("mongoose");
const FavoriteSchema = new mongoose_2.Schema({
    label: { type: String, required: true },
    itemId: { type: String, required: true },
    user: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User", required: true },
});
exports.Favorite = mongoose_1.default.model("Favorite", FavoriteSchema);
