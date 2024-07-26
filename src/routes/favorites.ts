import express, { Request, Response } from "express";

import { Favorite } from "../models/Favorites";

import { RequestExtended } from "../types/types";
import { isAuthenticated } from "../middelware/isAuthenticated";
export const router = express.Router();

// //all favorites (characters and comics)
// router.get("/favorites", async (req, res) => {
//     try {
//       const { id } = req.query;
//       const favorites = await Favorite.find({ user: id }).populate({
//         path: "user",
//         select: "_id username email",
//       });

//       console.log("id===>", id);
//       console.log("favorite=>", favorites);

//       const responseComics = await axios.get(
//         `https://lereacteur-marvel-api.herokuapp.com/comics?apiKey=${process.env.API_KEY}`
//       );

//       const responseCharacters = await axios.get(
//         `https://lereacteur-marvel-api.herokuapp.com/characters?apiKey=${process.env.API_KEY}`
//       );

//       const comics = responseComics.data.results;
//       const characters = responseCharacters.data.results;

//       const arrayOfFavorites = [];

//       for (let i = 0; i < favorites.length; i++) {
//         for (let j = 0; j < characters.length; j++) {
//           if (favorites[i].itemId === characters[j]._id) {
//             if (favorites[i].user.email === email) {
//               characters[j]["label"] = "character";
//               characters[j]["user"] = favorites[i].user._id;
//               arrayOfFavorites.push(characters[j]);
//             }
//           }
//         }
//       }

//       for (let i = 0; i < favorites.length; i++) {
//         for (let j = 0; j < comics.length; j++) {
//           if (favorites[i].itemId === comics[j]._id) {
//             if (favorites[i].user.email === email) {
//               comics[j]["label"] = "comic";
//               comics[j]["user"] = favorites[i].user._id;
//               arrayOfFavorites.push(comics[j]);
//             }
//           }
//         }
//       }
//       console.log("arrayOfFavorites==>", arrayOfFavorites);
//       res.status(200).json(arrayOfFavorites);
//     } catch (error) {
//       res.status(500).json({ message: error.message });
//     }
//   });

//persiste a favorite (character or comics) in db
router.post(
  "/favorites",
  isAuthenticated,
  async (req: RequestExtended, res: Response) => {
    try {
      const { itemId, label } = req.body;

      // console.log("body req user", req.user);
      //Verify if item (character or comics) is already favorite, not do anything but return the item
      const favoriteExist = await Favorite.findOne({ itemId: itemId });
      if (favoriteExist && favoriteExist.user === req.user._id) {
        //no action on db
        res.status(201).json({ favoriteExists: favoriteExist });
      } else {
        const favorite = new Favorite({
          itemId,
          label,
          user: req.user,
        });

        await favorite.save();
        // console.log("favorite here=>", favorite);
        res.status(201).json(favorite);
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.delete("/favorites/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const favorite = await Favorite.findOne({ itemId: id });
    //si pas de favorite ==> envoi d'erreur
    if (!favorite) {
      console.log("ici");
      return res.status(400).json({ error: "favorite doesn't exist!" });
    }

    await Favorite.deleteOne({ itemId: id });

    res.status(201).json(favorite);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});
