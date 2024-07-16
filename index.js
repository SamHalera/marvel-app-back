require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const cloudinary = require("cloudinary").v2;
const cors = require("cors");
const app = express();
const axios = require("axios");

app.use(cors());
app.use(express.json());

const isAuthenticated = require("./middlewares/IsAuthenticated");

//Use routers
const characterRoutes = require("./routes/characters");
const comicsRoutes = require("./routes/comics");
const userRoutes = require("./routes/user");
const favoritesRoutes = require("./routes/favorites");
const testApiRoutes = require("./routes/testApi");
app.use(characterRoutes);
app.use(comicsRoutes);
app.use(userRoutes);
app.use(favoritesRoutes);
app.use(testApiRoutes);

//connect to DB
mongoose.connect(process.env.MONGODB_URI);

//connect to my cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

//HOME PAGE we get comics and characters limit to 20 itemz each
app.get("/", async (req, res) => {
  console.log("hello");
  try {
    const { limit } = req.query;

    console.log("limit===>", limit);
    const query = `&limit=${limit}`;

    const promiseCharacters = axios.get(
      `https://lereacteur-marvel-api.herokuapp.com/characters?apiKey=${process.env.API_KEY}${query}`
    );
    const promiseComics = axios.get(
      `https://lereacteur-marvel-api.herokuapp.com/comics?apiKey=${process.env.API_KEY}${query}`
    );

    const results = await axios.all([promiseCharacters, promiseComics]);

    const arrayOfData = results.map((item) => {
      return item.data;
    });

    res.status(200).json(arrayOfData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
//Deal with not found page (404)
app.all("*", (req, res) => {
  res.status(404).json({ message: "MARVEL :This page does not exist" });
});

//Start the server
// port 3000 just for local dev... we let the prod server to listent to its own port

app.listen(process.env.PORT, () => {
  console.log("Serverd started...");
});
