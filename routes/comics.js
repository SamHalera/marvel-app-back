const express = require("express");
const axios = require("axios");
const Favorite = require("../models/Favorite");
const isAuthenticated = require("../middlewares/IsAuthenticated");
const router = express.Router();

router.post("/comics", isAuthenticated, async (req, res) => {
  console.log("INSIDE COMICS");
  try {
    //PARAMS ACCEPTED AND OPTIONAL:
    //limit => between 1 and 100
    //skip => number of results to ignore
    //title => search a character by title
    const { title, limit, skip, token } = req.body;

    let query = "";

    // const objForQuery = {};

    let limitForQuery = 100;

    if (limit || title || skip) {
      if (limit < 1 || limit > 100) {
        return res.status(400).json({ message: "Bad request" });
      }

      if (title) {
        query += `&title=${title}`;
      }
      if (skip) {
        let skipForQuery = skip * limitForQuery - limitForQuery;

        query += `&skip=${skipForQuery}`;
      }
    }

    const response = await axios.get(
      `https://lereacteur-marvel-api.herokuapp.com/comics?apiKey=${process.env.API_KEY}${query}`
    );

    if (token) {
      const user = req.user;
      const favorites = await Favorite.find().populate({
        path: "user",
        select: "_id username token",
      });

      const comics = response.data.results;

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

    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//GET COMICS BY CHARACTHER ID
//Page of one character with the comics in relation to him
router.post("/comics/:characterId", isAuthenticated, async (req, res) => {
  try {
    const characterId = req.params.characterId;

    const user = req.user;

    const response = await axios.get(
      `https://lereacteur-marvel-api.herokuapp.com/comics/${characterId}?apiKey=${process.env.API_KEY}`
    );

    const character = response.data;
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
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.post("/comic", isAuthenticated, async (req, res) => {
  try {
    // const comicId = req.params.comicId;
    const { id } = req.body;

    const user = req.user;
    const response = await axios.get(
      `https://lereacteur-marvel-api.herokuapp.com/comic/${id}?apiKey=${process.env.API_KEY}`
    );
    const comic = response.data;
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
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
module.exports = router;
