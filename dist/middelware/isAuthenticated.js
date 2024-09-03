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
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuthenticated = void 0;
const User_1 = require("../models/User");
const isAuthenticated = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    //Je recupère le token dans le header de la requete
    if (req.headers.authorization) {
        const tokenFromHeaders = req.headers.authorization.replace("Bearer ", "");
        //je verifie si le token existe bien en base
        // ==> avec select on demande à mongoose de ne selectionner que les clé id et account pour l'objet user que j'envoie à req.user
        // pour des raisons de sécurité, on décide de ne pase faire balader des infos confidentielle de l'utilisateur (salt hash token)
        const user = yield User_1.User.findOne({ token: tokenFromHeaders }).select("username _id email");
        if (!user) {
            //si je trouve pas de user ==> erreur 410
            return res.status(401).json({ message: "Unauthorized!" });
        }
        else {
            //SI je trouve le user je crée une clé user dans la requete et j'envoie tout à la function suivante
            req.user = user;
            return next();
        }
    }
    else {
        //si la requete n'envoi pas de headers avec un token
        return res.status(401).json({ message: "Unauthorized!" });
    }
});
exports.isAuthenticated = isAuthenticated;
