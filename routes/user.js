const express = require("express");
// const mongoose = require("mongoose");
const axios = require("axios");
const User = require("../models/User");
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;
const isAuthenticated = require("../middlewares/IsAuthenticated");
const convertToBase64 = require("../utilis/convertToBase64");

const router = express.Router();

//Sign Up creat new User
router.post("/user/signup", async (req, res) => {
  console.log(req.header);
  try {
    const { email, password, username } = req.body;

    console.log("body=>", req.body);

    //If username or email are not filler send an error message
    //sanitize all data sent by user ==> package `dompurify` ?
    if (!email || !password || !username) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    //verify if email already exists in DB
    const existingUser = await User.findOne({ email: email });
    //If user exists we send an error message
    if (existingUser !== null) {
      return res.status(409).json({ message: "This email already exists!" });
    }

    //create a salt of 16 characters
    const salt = uid2(16);

    // Create a hash with password string and sall string
    const hash = SHA256(password + salt).toString(encBase64);

    //create a token
    const token = uid2(64);

    // console.log(req.body);
    // console.log("salt => ", salt);
    // console.log("hash => ", hash);

    //create an User instance
    const newUser = new User({
      email,
      username,
      token,
      hash,
      salt,
    });

    //persist new user in DB
    await newUser.save();

    console.log("new user:", newUser);
    res.status(201).json({
      _id: newUser._id,
      email: newUser.email,
      username: newUser.username,
      token: newUser.token,
      status: 201,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//LOGIN
router.post("/user/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("email===>", email);
    if (!email || !password) {
      return res.status(400).json({
        message: "All fields are required!",
      });
    }
    console.log("email befor find===>", email);
    const user = await User.findOne({ email: email });

    console.log("after find===>", email);
    if (user === null) {
      console.log("email dans if===>", email);
      return res.status(401).json({ message: "Unauthorized!" });
    }
    console.log("email out of if===>", email);
    //Je compare le hash du user en BD avec le hash du req.body.password + user.salt
    const newHash = SHA256(password + user.salt).toString(encBase64);
    if (newHash !== user.hash) {
      console.log("hash =>", user.salt);
      //statyus 401 unauthorized
      return res.status(401).json({ message: "Unauthorized!" });
    }

    //if User is OK
    console.log("User is OK");
    res.status(200).json({
      _id: user._id,
      token: user.token,
      email: user.email,
      username: user.username,
      avatar: user.avatar?.secure_url,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//GET USER FROM ID
router.get("/profile", isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById({ _id: req.user._id }).select(
      "username _id email avatar"
    );

    return res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//UPDATE USER INFOS (picture, username, password)
router.put("/profile", isAuthenticated, fileUpload(), async (req, res) => {
  const { username, password, newPassword } = req.body;

  console.log("body===>", req.body);
  console.log("req.files==>", req.files);
  try {
    const user = await User.findById({ _id: req.user._id });

    //if we detect changes in request we pass throught all checks and finally we save the new user
    if (username || (password && newPassword) || req.files) {
      console.log("INSIDE");
      if (username) {
        console.log("USERNAME");
        user.username = username;
      }
      if (password && !newPassword) {
        console.log("PASS NO NEWPASS");
        return res.status(400).json({
          message:
            "If you want to change your password please enter a new password",
        });
      } else if (!password && newPassword) {
        console.log("NEW PASS NO PASS");
        return res.status(400).json({
          message: "It seems you forget to enter your current password",
        });
      } else {
        if (password && newPassword) {
          console.log("GOOD");
          const newHash = SHA256(password + user.salt).toString(encBase64);
          if (newHash !== user.hash) {
            console.log("NOOOP");
            return res.status(400).json({ message: "Invalid credentials" });
          } else {
            const salt = uid2(16);
            const hash = SHA256(newPassword + salt).toString(encBase64);
            user.salt = salt;
            user.hash = hash;
          }
        }
      }

      if (req.files) {
        let userFolderPath;
        let previousPublicId;
        console.log("ICI");

        if (!user.avatar) {
          console.log("no avatar yet");
          //create folder for marvel project > users
          console.log("user id---->", user._id);
          const userFolder = await cloudinary.api.create_folder(
            `/marvel/users/${user._id}`
          );
          userFolderPath = userFolder.path;
          console.log("folder path inside if==>", userFolderPath);
        } else {
          console.log("yes avatar");
          const userFolder = `/marvel/users/${user._id}`;
          userFolderPath = userFolder;
          //if user has already a picture we keep its public_id in order to delete it after uploading the new one
          previousPublicId = user.avatar.public_id;
        }

        console.log("folder path==>", userFolderPath);
        //Tranformation de l'image en string avant save sur cloudinary
        const pictureToUpload = req.files.picture;
        const transformedPicture = convertToBase64(pictureToUpload);
        //console.log(pictureToUpload);

        const pictureToSave = await cloudinary.uploader.upload(
          transformedPicture,
          { folder: userFolderPath }
        );

        //new picture replaced the previous for user object
        user.avatar = pictureToSave;

        console.log("user avatar==>", user.avatar);
        //New picture is uploaded with success in CLoudinary. We can delete the old one
        if (previousPublicId) {
          await cloudinary.uploader.destroy(previousPublicId, {
            folder: userFolderPath,
          });
        }
      }
      await user.save();
    }
    return res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//This route is not used any more
//Use post("/favorites") insted
router.put("/favorites/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    //si pas de user ==> e,nvoi d'erreur
    if (!user) {
      return res.status(400).json({ error: "User doesn't exist!" });
    }

    const { addCharacter, addComic, removeCharacter, removeComic } = req.query;

    if (addCharacter) {
      user.favorites.characters.push(addCharacter);
    }
    if (addComic) {
      user.favorites.comics.push(addComic);
    }
    if (removeCharacter) {
      const index = user.favorites.characters.indexOf(removeCharacter);
      user.favorites.characters.splice(index, 1);
    }
    if (removeComic) {
      const index = user.favorites.comics.indexOf(removeComic);
      console.log(index);
      user.favorites.comics.splice(index, 1);
    }
    await user.save();
    res.status(201).json(user.favorites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
