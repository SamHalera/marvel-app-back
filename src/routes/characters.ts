import express, { Request, Response } from "express";

import { Favorite } from "../models/Favorites";

import { RequestExtended } from "../types/types";
import { isAuthenticated } from "../middelware/isAuthenticated";
export const router = express.Router();

router.post(
  "/characters",
  isAuthenticated,
  async (req: RequestExtended, res: Response) => {
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

      const response = await fetch(
        `https://lereacteur-marvel-api.herokuapp.com/characters?apiKey=${process.env.API_KEY}${query}`
      );

      const data = await response.json();

      if (token) {
        const user = req.user;
        const favorites = await Favorite.find().populate({
          path: "user",
          select: "_id username token",
        });

        const characters = data.results;

        for (let i = 0; i < favorites.length; i++) {
          for (let j = 0; j < characters.length; j++) {
            if (favorites[i].itemId === characters[j]._id) {
              if (favorites[i].user.token === token) {
                characters[j]["isFavorite"] = true;
              } else {
                characters[j]["isFavorite"] = false;
              }
            }
          }
        }
      }

      res.status(200).json({ data });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.get("/character/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const response = await fetch(
      `https://lereacteur-marvel-api.herokuapp.com/character/${id}?apiKey=${process.env.API_KEY}`
    );

    const data = await response.json();
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});
