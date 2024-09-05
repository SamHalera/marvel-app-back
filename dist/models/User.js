"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_2 = require("mongoose");
const userSchema = new mongoose_2.Schema({
    email: { type: String, required: true },
    username: { type: String, required: true },
    token: { type: String, required: true },
    hash: { type: String, required: true },
    salt: { type: String, required: true },
    avatar: { type: Object, required: false },
});
exports.User = mongoose_1.default.model("User", userSchema);
