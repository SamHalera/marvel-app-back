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
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const Favorites_1 = require("../models/Favorites");
const isAuthenticated_1 = require("../middelware/isAuthenticated");
exports.router = express_1.default.Router();
exports.router.post("/characters", isAuthenticated_1.isAuthenticated, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //PARAMS ACCEPTED AND OPTIONAL:
        //limit => between 1 and 100
        //skip => number of results to ignore
        //name => search a character by name
        const { name, skip, token } = req.body;
        let query = "";
        let limitForQuery = 100;
        if (name || skip) {
            if (name) {
                query += `&name=${name}`;
            }
            if (skip) {
                let skipForQuery = skip * limitForQuery - limitForQuery;
                query += `&skip=${skipForQuery}`;
            }
        }
        const response = yield fetch(`https://lereacteur-marvel-api.herokuapp.com/characters?apiKey=${process.env.API_KEY}${query}`);
        const data = yield response.json();
        if (token) {
            const user = req.user;
            const favorites = yield Favorites_1.Favorite.find().populate({
                path: "user",
                select: "_id username token",
            });
            const characters = data.results;
            for (let i = 0; i < favorites.length; i++) {
                for (let j = 0; j < characters.length; j++) {
                    if (favorites[i].itemId === characters[j]._id) {
                        if (favorites[i].user.token === token) {
                            characters[j]["isFavorite"] = true;
                        }
                        else {
                            characters[j]["isFavorite"] = false;
                        }
                    }
                }
            }
        }
        res.status(200).json({ data });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
exports.router.get("/character/:id", isAuthenticated_1.isAuthenticated, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const response = yield fetch(`https://lereacteur-marvel-api.herokuapp.com/character/${id}?apiKey=${process.env.API_KEY}`);
        const data = yield response.json();
        res.status(200).json(data);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
