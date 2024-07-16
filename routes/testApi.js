const express = require("express");
const axios = require("axios");
const cripto = require("crypto-js");
const encBase64 = require("crypto-js/enc-base64");

const router = express.Router();

router.get("/test/characters", async (req, res) => {
  try {
    const ts = Date.now();

    const myHash = "b337f111e491803deac55aada4f17fd0";
    const hash = cripto
      .MD5(ts + process.env.MARVEL_PRIVATE_KEY + process.env.MARVEL_PUBLIC_KEY)
      .toString(encBase64);
    // const response = await axios.get(
    //   `http://gateway.marvel.com/v1/public/comics?ts=${ts}&apikey=${publicKEY}&hash=${hash}`
    // );
    console.log(
      `http://gateway.marvel.com/v1/public/characters?ts=${ts}&apikey=${process.env.MARVEL_PUBLIC_KEY}&hash=${myHash}`
    );
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
module.exports = router;
