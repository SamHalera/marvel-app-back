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
//all favorites (characters and comics)
exports.router.get("/favorites", isAuthenticated_1.isAuthenticated, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const favorites = yield Favorites_1.Favorite.find({ user: req.user._id }).populate({
            path: "user",
            select: "_id username email",
        });
        const responseComics = yield fetch(`https://lereacteur-marvel-api.herokuapp.com/comics?apiKey=${process.env.API_KEY}`);
        const responseCharacters = yield fetch(`https://lereacteur-marvel-api.herokuapp.com/characters?apiKey=${process.env.API_KEY}`);
        const dataComics = yield responseComics.json();
        const dataCharacters = yield responseCharacters.json();
        const comics = dataComics.results;
        const characters = dataCharacters.results;
        const arrayOfFavorites = [];
        for (let i = 0; i < favorites.length; i++) {
            for (let j = 0; j < characters.length; j++) {
                if (favorites[i].itemId === characters[j]._id) {
                    if (favorites[i].user.email === req.user.email) {
                        characters[j]["label"] = "character";
                        characters[j]["user"] = favorites[i].user.email;
                        arrayOfFavorites.push(characters[j]);
                    }
                }
            }
        }
        for (let i = 0; i < favorites.length; i++) {
            for (let j = 0; j < comics.length; j++) {
                if (favorites[i].itemId === comics[j]._id) {
                    if (favorites[i].user.email === req.user.email) {
                        comics[j]["label"] = "comic";
                        comics[j]["user"] = favorites[i].user.email;
                        arrayOfFavorites.push(comics[j]);
                    }
                }
            }
        }
        res.status(200).json(arrayOfFavorites);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
//persiste a favorite (character or comics) in db
exports.router.post("/favorites", isAuthenticated_1.isAuthenticated, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { itemId, label } = req.body;
        //Verify if item (character or comics) is already favorite, not do anything but return the item
        const favoriteExist = yield Favorites_1.Favorite.findOne({ itemId: itemId });
        if (favoriteExist && favoriteExist.user === req.user._id) {
            //no action on db
            res.status(201).json({ favoriteExists: favoriteExist });
        }
        else {
            const favorite = new Favorites_1.Favorite({
                itemId,
                label,
                user: req.user,
            });
            yield favorite.save();
            res.status(201).json(favorite);
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
exports.router.delete("/favorites/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const favorite = yield Favorites_1.Favorite.findOne({ itemId: id });
        //si pas de favorite ==> envoi d'erreur
        if (!favorite) {
            return res.status(400).json({ error: "favorite doesn't exist!" });
        }
        yield Favorites_1.Favorite.deleteOne({ itemId: id });
        res.status(201).json(favorite);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
