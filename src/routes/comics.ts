import express, { Response } from "express";

import { Favorite } from "../models/Favorites";

import { RequestExtended } from "../types/types";
import { isAuthenticated } from "../middelware/isAuthenticated";
export const router = express.Router();

router.post(
  "/comics",

  isAuthenticated,
  async (req: RequestExtended, res: Response) => {
    try {
      //PARAMS ACCEPTED AND OPTIONAL:
      //limit => between 1 and 100
      //skip => number of results to ignore
      //title => search a character by title
      const { title, skip, token } = req.body;

      let query = "";

      let limitForQuery = 100;

      if (title || skip) {
        if (title) {
          query += `&title=${title}`;
        }
        if (skip) {
          let skipForQuery = skip * limitForQuery - limitForQuery;

          query += `&skip=${skipForQuery}`;
        }
      }

      const response = await fetch(
        `https://lereacteur-marvel-api.herokuapp.com/comics?apiKey=${process.env.API_KEY}${query}`
      );

      const data = await response.json();
      if (token) {
        const user = req.user;
        const favorites = await Favorite.find().populate({
          path: "user",
          select: "_id username token",
        });

        const comics = data.results;

        for (let i = 0; i < favorites.length; i++) {
          for (let j = 0; j < comics.length; j++) {
            if (favorites[i].itemId === comics[j]._id) {
              if (favorites[i].user.token === token) {
                comics[j]["isFavorite"] = true;
              } else {
                comics[j]["isFavorite"] = false;
              }
            }
          }
        }
      }

      res.status(200).json(data);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);

//GET COMICS BY CHARACTHER ID
//Page of one character with the comics in relation to him
router.post(
  "/comics/:characterId",

  isAuthenticated,
  async (req: RequestExtended, res: Response) => {
    try {
      const characterId = req.params.characterId;

      const user = req.user;

      const response = await fetch(
        `https://lereacteur-marvel-api.herokuapp.com/comics/${characterId}?apiKey=${process.env.API_KEY}`
      );

      const data = await response.json();
      const character = data;
      if (user) {
        const favorite = await Favorite.findOne({
          user: user._id,
          itemId: characterId,
        }).populate({
          path: "user",
          select: "_id username email",
        });

        if (favorite) {
          character["isFavorite"] = true;
        }
      }

      res.status(200).json(character);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.get(
  "/comic/:id",

  isAuthenticated,
  async (req: RequestExtended, res: Response) => {
    try {
      const { id } = req.params;

      const user = req.user;
      const response = await fetch(
        `https://lereacteur-marvel-api.herokuapp.com/comic/${id}?apiKey=${process.env.API_KEY}`
      );

      const data = await response.json();
      const comic = data;
      if (user) {
        const favorite = await Favorite.findOne({
          user: user._id,
          itemId: id,
        }).populate({
          path: "user",
          select: "_id username email",
        });

        if (favorite) {
          comic["isFavorite"] = true;
        }
      }

      res.status(200).json(comic);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);
