const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  mrp: {
    type: Number,
    required: true,
  },
  discount: {
    type: Number,
    default: 0, 
  },
  finalPrice: {
    type: Number,
  },
  description: {
    type: String,
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

productSchema.pre("save", function (next) {
  this.finalPrice = this.mrp - (this.mrp * this.discount) / 100;
  next();
});

module.exports = mongoose.model("Product", productSchema);