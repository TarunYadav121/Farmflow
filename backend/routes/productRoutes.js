const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const { protect, isSeller } = require("../middleware/authMiddleware");
// Add products:
router.post("/add", protect,isSeller, async (req, res) => {
  try {
    const { name, mrp, discount, description } = req.body;

    const product = new Product({
      name,
      mrp,
      discount,
      description,
      seller: req.user.id,
    });

    await product.save();

    res.json({ message: "Product added successfully", product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get products:
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports=router;