const express = require("express");
const axios = require("axios");
const Favorite = require("../models/Favorite");
const isAuthenticated = require("../middlewares/IsAuthenticated");
const router = express.Router();

//retreive chaarcters passing data by post body
router.post("/characters", isAuthenticated, async (req, res) => {
  try {
    console.log("INSIDE CHARACTERS");

    //PARAMS ACCEPTED AND OPTIONAL:
    //limit => between 1 and 100
    //skip => number of results to ignore
    //name => search a character by name
    const { name, limit, skip, token } = req.body;

    let query = "";

    let limitForQuery = 100;
    if (name || limit || skip) {
      if (limit < 1 || limit > 100) {
        return res.status(400).json({ message: "Bad request" });
      }

      if (name) {
        query += `&name=${name}`;
      }
      if (skip) {
        let skipForQuery = skip * limitForQuery - limitForQuery;

        query += `&skip=${skipForQuery}`;
      }
    }

    const response = await axios.get(
      `https://lereacteur-marvel-api.herokuapp.com/characters?apiKey=${process.env.API_KEY}${query}`
    );

    if (token) {
      const user = req.user;
      const favorites = await Favorite.find().populate({
        path: "user",
        select: "_id username token",
      });

      const characters = response.data.results;

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

    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/character/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.get(
      `https://lereacteur-marvel-api.herokuapp.com/character/${id}?apiKey=${process.env.API_KEY}`
    );

    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
module.exports = router;
