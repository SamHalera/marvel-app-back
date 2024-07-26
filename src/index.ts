const cloudinary = require("cloudinary").v2;
import dotenv from "dotenv";
import mongoose from "mongoose";
import express, { Express, Request, Response } from "express";
import bodyParser from "body-parser";
// const express = require("express");
import cors from "cors";

import { router as characterRouter } from "./routes/characters";
import { router as comicRouter } from "./routes/comics";
import { router as favoriteRouter } from "./routes/favorites";
import { router as userRouter } from "./routes/user";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const app: Express = express();

// app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use(characterRouter);
app.use(comicRouter);
app.use(userRouter);
app.use(favoriteRouter);

//connect to DB

mongoose.connect(process.env.MONGODB_URI ?? "");

//HOME PAGE we get comics and characters limit to 20 itemz each
app.get("/", async (req, res) => {
  try {
    const { limit } = req.query;

    const query = `&limit=${limit}`;

    const responseCharacters = await fetch(
      `https://lereacteur-marvel-api.herokuapp.com/characters?apiKey=${process.env.API_KEY}${query}`
    );
    const responseComics = await fetch(
      `https://lereacteur-marvel-api.herokuapp.com/comics?apiKey=${process.env.API_KEY}${query}`
    );

    const dataCharacters = await responseCharacters.json();
    const dataComics = await responseComics.json();
    const arrayOfData = [dataCharacters, dataComics];

    res.status(200).json(arrayOfData);
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});
app.all("*", (req: Request, res: Response) => {
  res.status(404).json({ message: "MARVEL: THIS PAGE DOES NOT EXIST" });
});

app.listen(process.env.PORT, () => {
  console.log("Serverd started...");
});
