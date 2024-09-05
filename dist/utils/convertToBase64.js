"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToBase64 = void 0;
const convertToBase64 = (file) => {
    return `data:${file.mimetype};base64,${file.data.toString("base64")}`;
};
exports.convertToBase64 = convertToBase64;
