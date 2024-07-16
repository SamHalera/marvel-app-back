const express = require("express");
// const mongoose = require("mongoose");
const axios = require("axios");
const Favorite = require("../models/Favorite");
const isAuthenticated = require("../middlewares/IsAuthenticated");

const router = express.Router();

//all favorites (characters and comics)
router.get("/favorites", async (req, res) => {
  try {
    const { email, id } = req.query;
    const favorites = await Favorite.find({ user: id }).populate({
      path: "user",
      select: "_id username email",
    });

    console.log("id===>", id);
    console.log("favorite=>", favorites);

    const responseComics = await axios.get(
      `https://lereacteur-marvel-api.herokuapp.com/comics?apiKey=${process.env.API_KEY}`
    );

    const responseCharacters = await axios.get(
      `https://lereacteur-marvel-api.herokuapp.com/characters?apiKey=${process.env.API_KEY}`
    );

    const comics = responseComics.data.results;
    const characters = responseCharacters.data.results;

    const arrayOfFavorites = [];

    for (let i = 0; i < favorites.length; i++) {
      for (let j = 0; j < characters.length; j++) {
        if (favorites[i].itemId === characters[j]._id) {
          if (favorites[i].user.email === email) {
            characters[j]["label"] = "character";
            characters[j]["user"] = favorites[i].user._id;
            arrayOfFavorites.push(characters[j]);
          }
        }
      }
    }

    for (let i = 0; i < favorites.length; i++) {
      for (let j = 0; j < comics.length; j++) {
        if (favorites[i].itemId === comics[j]._id) {
          if (favorites[i].user.email === email) {
            comics[j]["label"] = "comic";
            comics[j]["user"] = favorites[i].user._id;
            arrayOfFavorites.push(comics[j]);
          }
        }
      }
    }
    console.log("arrayOfFavorites==>", arrayOfFavorites);
    res.status(200).json(arrayOfFavorites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//persiste a favorite (character or comics) in db
router.post("/favorites", isAuthenticated, async (req, res) => {
  try {
    const { itemId, label } = req.body;

    console.log("body", req.body);
    console.log("body req user", req.user);
    //Verify if item (character or comics) is already favorite, not do anything but return the item
    const favoriteExist = await Favorite.findOne({ itemId: itemId });
    if (favoriteExist && favoriteExist.user === req.user._id) {
      console.log("user-favorite exists=>", favoriteExist.user);
      console.log("user-from req=>", req.user._id);
      console.log("favorite exists already");
      //no action on db
      res.status(201).json({ favoriteExists: favoriteExist });
    } else {
      console.log("favorite does not exist", itemId + " , " + label);
      const favorite = new Favorite({
        itemId,
        label,
        user: req.user,
      });

      await favorite.save();
      console.log("favorite here=>", favorite);
      res.status(201).json(favorite);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/favorites/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("id==>", id);
    const favorite = await Favorite.findOne({ itemId: id });
    //si pas de favorite ==> envoi d'erreur
    if (!favorite) {
      console.log("ici");
      return res.status(400).json({ error: "favorite doesn't exist!" });
    }

    await Favorite.deleteOne({ itemId: id });

    // console.log(favorite);
    res.status(201).json(favorite);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
