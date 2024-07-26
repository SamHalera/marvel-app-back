const cloudinary = require("cloudinary").v2;
import express, { Request, Response } from "express";

import { User } from "../models/User";
import uid2 from "uid2";
import SHA256 from "crypto-js/sha256";
import encBase64 from "crypto-js/enc-base64";
import fileUpload from "express-fileupload";
import { RequestExtended } from "../types/types";
import { isAuthenticated } from "../middelware/isAuthenticated";
import { error } from "console";
import { convertToBase64 } from "../utils/convertToBase64";
export const router = express.Router();

//Sign Up creat new User
router.post("/user/signup", async (req: Request, res: Response) => {
  try {
    const { email, password, username } = req.body;

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

    res.status(201).json({
      //   _id: newUser._id,
      //   email: newUser.email,
      //   username: newUser.username,
      token: newUser.token,
      //   status: 201,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

//LOGIN
router.post("/user/login", async (req, res) => {
  try {
    console.log("hello login");
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "All fields are required!",
      });
    }

    console.log(email);
    const user = await User.findOne({ email: email });

    if (user === null) {
      return res.status(401).json({ message: "Unauthorized!" });
    }

    //Je compare le hash du user en BD avec le hash du req.body.password + user.salt
    const newHash = SHA256(password + user.salt).toString(encBase64);
    if (newHash !== user.hash) {
      //statyus 401 unauthorized
      return res.status(401).json({ message: "Unauthorized!" });
    }

    //if User is OK

    res.status(200).json({
      //   _id: user._id,
      token: user.token,
      //   email: user.email,
      //   username: user.username,
      // avatar: user.avatar?.secure_url,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

//GET USER FROM ID
router.get(
  "/user/profile",
  isAuthenticated,
  async (req: RequestExtended, res: Response) => {
    try {
      const user = await User.findById({ _id: req.user._id }).select(
        "username email avatar -_id"
      );

      return res.status(200).json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);
//GET USER FROM ID
router.get(
  "/user/avatar",
  isAuthenticated,
  async (req: RequestExtended, res: Response) => {
    try {
      const user = await User.findById({ _id: req.user._id }).select(
        "avatar -_id"
      );

      return res.status(200).json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);

//UPDATE USER INFOS (picture, username, password)
// router.put("/profile", isAuthenticated, fileUpload(), async (req, res) => {
router.post(
  "/user/profile",
  isAuthenticated,
  fileUpload(),
  async (req: RequestExtended, res: Response) => {
    const { username, password, newPassword, picture } = req.body;

    console.log("body==>", req.body);
    try {
      console.log("put profile", req.user);

      const user = await User.findById({ _id: req.user._id });

      if (user === null) {
        return res.status(401).json({ message: "Unauthorized!" });
      }

      //if we detect changes in request we pass throught all checks and finally we save the new user
      //   if (username || (password && newPassword) || req.files) {
      //   if (username || (password && newPassword)) {
      if (username) {
        user.username = username;
      }
      if (!password && newPassword) {
        return res.status(400).json({
          error: "password",
          message: "It seems you forget to enter your current password",
        });
      } else {
        if (password && newPassword) {
          const newHash = SHA256(password + user.salt).toString(encBase64);
          if (newHash !== user.hash) {
            console.log("bad request");
            return res
              .status(400)
              .json({ type: "error", message: "Invalid credentials" });
          } else {
            const salt = uid2(16);
            const hash = SHA256(newPassword + salt).toString(encBase64);
            user.salt = salt;
            user.hash = hash;
          }
        }
      }

      if (req.files) {
        console.log("file ici");
        let userFolderPath;
        let previousPublicId;

        if (!user.avatar) {
          //create folder for marvel project > users
          const userFolder = await cloudinary.api.create_folder(
            `/marvel/users/${user._id}`
          );
          userFolderPath = userFolder.path;
        } else {
          const userFolder = `/marvel/users/${user._id}`;
          userFolderPath = userFolder;
          //if user has already a picture we keep its public_id in order to delete it after uploading the new one
          previousPublicId = user.avatar.public_id;
        }

        const pictureToUpload = req.files.picture;
        const transformedPicture = convertToBase64(pictureToUpload);

        const pictureToSave = await cloudinary.uploader.upload(
          transformedPicture,
          { folder: userFolderPath }
        );

        //new picture replaced the previous for user object
        user.avatar = pictureToSave;

        //New picture is uploaded with success in CLoudinary. We can delete the old one
        if (previousPublicId) {
          await cloudinary.uploader.destroy(previousPublicId, {
            folder: userFolderPath,
          });
        }
      }

      await user.save();
      //   }

      return res.status(200).json({
        email: user.email,
        username: user.username,
        avatar: user.avatar,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);
