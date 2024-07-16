const mongoose = require("mongoose");

const Favorite = mongoose.model("Favorites", {
  label: String,
  itemId: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = Favorite;
