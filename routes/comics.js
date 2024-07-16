const express = require("express");
const axios = require("axios");
const Favorite = require("../models/Favorite");
const isAuthenticated = require("../middlewares/IsAuthenticated");
const router = express.Router();

router.get("/comics", async (req, res) => {
  console.log("INSIDE COMICS");
  try {
    //PARAMS ACCEPTED AND OPTIONAL:
    //limit => between 1 and 100
    //skip => number of results to ignore
    //title => search a character by title
    const { title, limit, skip, email } = req.query;

    console.log("title=>", title);
    console.log("limit=>", limit);
    console.log("skip=>", skip);

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
        console.log(skipForQuery);
        query += `&skip=${skipForQuery}`;
      }

      console.log("limit typeof: ", typeof skip);
    }

    console.log(query);
    const response = await axios.get(
      `https://lereacteur-marvel-api.herokuapp.com/comics?apiKey=${process.env.API_KEY}${query}`
    );
    // console.log(response.data);

    if (email) {
      const favorites = await Favorite.find().populate({
        path: "user",
        select: "_id username email",
      });

      const comics = response.data.results;

      for (let i = 0; i < favorites.length; i++) {
        for (let j = 0; j < comics.length; j++) {
          if (favorites[i].itemId === comics[j]._id) {
            if (favorites[i].user.email === email) {
              comics[j]["isFavorite"] = true;
            } else {
              comics[j]["isFavorite"] = false;
            }
          }
        }
      }
      console.log(favorites);
    }

    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//GET COMICS BY CHARACTHER ID
//Page of one character with the comics in relation to him
router.get("/comics/:characterId", async (req, res) => {
  try {
    const characterId = req.params.characterId;
    console.log(characterId);

    const { userId } = req.query;
    const response = await axios.get(
      `https://lereacteur-marvel-api.herokuapp.com/comics/${characterId}?apiKey=${process.env.API_KEY}`
    );

    console.log(userId);
    const character = response.data;
    if (userId) {
      const favorite = await Favorite.findOne({
        user: userId,
        itemId: characterId,
      }).populate({
        path: "user",
        select: "_id username email",
      });

      console.log("favorite===>", favorite);
      if (favorite) {
        character["isFavorite"] = true;
      }
    }

    console.log("charcter==>", character);
    res.status(200).json(character);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get("/comic/:comicId", async (req, res) => {
  try {
    const comicId = req.params.comicId;
    console.log(comicId);
    const { userId } = req.query;
    const response = await axios.get(
      `https://lereacteur-marvel-api.herokuapp.com/comic/${comicId}?apiKey=${process.env.API_KEY}`
    );
    const comic = response.data;
    // if (userId) {
    //   const favorite = await Favorite.findOne({
    //     user: userId,
    //     itemId: comicId,
    //   }).populate({
    //     path: "user",
    //     select: "_id username email",
    //   });

    //   console.log("favorite===>", favorite);
    //   if (favorite) {
    //     comic["isFavorite"] = true;
    //   }
    // }

    console.log("comic==>", comic);
    res.status(200).json(comic);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
module.exports = router;
