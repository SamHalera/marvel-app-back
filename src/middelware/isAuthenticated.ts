import { User } from "../models/User";
import { NextFunction, Request, Response } from "express";
import { RequestExtended } from "../types/types";
export const isAuthenticated = async (
  req: RequestExtended,
  res: Response,
  next: NextFunction
) => {
  //Je recupère le token dans le header de la requete
  if (req.headers.authorization) {
    const tokenFromHeaders = req.headers.authorization.replace("Bearer ", "");

    //je verifie si le token existe bien en base
    // ==> avec select on demande à mongoose de ne selectionner que les clé id et account pour l'objet user que j'envoie à req.user
    // pour des raisons de sécurité, on décide de ne pase faire balader des infos confidentielle de l'utilisateur (salt hash token)
    const user = await User.findOne({ token: tokenFromHeaders }).select(
      "username _id email"
    );
    if (!user) {
      //si je trouve pas de user ==> erreur 410
      return res.status(401).json({ message: "Unauthorized!" });
    } else {
      //SI je trouve le user je crée une clé user dans la requete et j'envoie tout à la function suivante
      req.user = user;

      return next();
    }
  } else {
    //si la requete n'envoi pas de headers avec un token
    return res.status(401).json({ message: "Unauthorized!" });
  }
};
