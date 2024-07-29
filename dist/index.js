"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const cloudinary = require("cloudinary").v2;
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
// const express = require("express");
const cors_1 = __importDefault(require("cors"));
const characters_1 = require("./routes/characters");
const comics_1 = require("./routes/comics");
const favorites_1 = require("./routes/favorites");
const user_1 = require("./routes/user");
dotenv_1.default.config();
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});
const app = (0, express_1.default)();
// app.use(express.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use(body_parser_1.default.json());
app.use((0, cors_1.default)());
app.use(characters_1.router);
app.use(comics_1.router);
app.use(user_1.router);
app.use(favorites_1.router);
//connect to DB
mongoose_1.default.connect((_a = process.env.MONGODB_URI) !== null && _a !== void 0 ? _a : "");
//HOME PAGE we get comics and characters limit to 20 itemz each
app.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { limit } = req.query;
        const query = `&limit=${limit}`;
        const responseCharacters = yield fetch(`https://lereacteur-marvel-api.herokuapp.com/characters?apiKey=${process.env.API_KEY}${query}`);
        const responseComics = yield fetch(`https://lereacteur-marvel-api.herokuapp.com/comics?apiKey=${process.env.API_KEY}${query}`);
        const dataCharacters = yield responseCharacters.json();
        const dataComics = yield responseComics.json();
        const arrayOfData = [dataCharacters, dataComics];
        res.status(200).json(arrayOfData);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
}));
app.all("*", (req, res) => {
    res.status(404).json({ message: "MARVEL: THIS PAGE DOES NOT EXIST" });
});
app.listen(process.env.PORT, () => {
    console.log("Serverd started...");
});
