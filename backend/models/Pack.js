const mongoose = require("mongoose");

const packSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  type: {
    type: String, // Weekly / Monthly
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  oldPrice: {
    type: Number
  },
  items: [
    {
      type: String
    }
  ],
  image: {
    type: String
  },
  category: {
    type: String // veg / dairy / essentials
  }
}, { timestamps: true });

module.exports = mongoose.model("Pack", packSchema);