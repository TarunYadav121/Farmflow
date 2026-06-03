const express = require("express");
const router  = express.Router();
const Product = require("../models/Product");
const { protect } = require("../middleware/authMiddleware");

// ─── Validation helper ────────────────────────────────────────────────────────
// Returns an error string if invalid, null if ok
function validateProductBody({ name, mrp, discount, stock }) {
  if (!name || typeof name !== 'string' || !name.trim()) {
    return 'Product name is required';
  }
  if (mrp === undefined || mrp === null || mrp === '') {
    return 'MRP is required';
  }
  if (Number(mrp) < 0) {
    return 'MRP cannot be negative';
  }
  if (discount !== undefined && (Number(discount) < 0 || Number(discount) > 100)) {
    return 'Discount must be between 0 and 100';
  }
  if (stock !== undefined && Number(stock) < 0) {
    return 'Stock cannot be negative';
  }
  return null;
}

// ─── Add product ──────────────────────────────────────────────────────────────
router.post("/add", protect, async (req, res) => {
  try {
    if (req.user.role !== "seller") {
      return res.status(403).json({ message: "Only sellers can add products" });
    }

    const { name, mrp, discount, description, image, category, stock } = req.body;

    const validationError = validateProductBody({ name, mrp, discount, stock });
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const product = new Product({
      name:        name.trim(),
      mrp:         Number(mrp),
      discount:    Number(discount ?? 0),
      description: description ?? '',
      image:       image ?? '',
      category:    category ?? 'other',
      stock:       Number(stock ?? 0),
      seller:      req.user.id,
    });

    await product.save();
    res.status(201).json({ message: "Product added successfully", product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── My products ──────────────────────────────────────────────────────────────
router.get("/my-products", protect, async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user.id });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Seller dashboard stats ───────────────────────────────────────────────────
router.get("/dashboard", protect, async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user.id });

    const totalProducts = products.length;
    const totalStock    = products.reduce((sum, p) => sum + p.stock, 0);
    const totalValue    = products.reduce((sum, p) => sum + p.finalPrice * p.stock, 0);

    res.json({ totalProducts, totalStock, totalValue });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Update product ───────────────────────────────────────────────────────────
router.put("/update/:id", protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    if (product.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { name, mrp, discount, description, image, category, stock, isActive } = req.body;

    // Validate only the fields that are being updated
    const validationError = validateProductBody({
      name:     name     ?? product.name,
      mrp:      mrp      ?? product.mrp,
      discount: discount ?? product.discount,
      stock:    stock    ?? product.stock,
    });
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    product.name        = name        ?? product.name;
    product.mrp         = mrp         ?? product.mrp;
    product.discount    = discount    ?? product.discount;
    product.description = description ?? product.description;
    product.image       = image       ?? product.image;
    product.category    = category    ?? product.category;
    product.stock       = stock       ?? product.stock;
    product.isActive    = isActive    ?? product.isActive;

    await product.save();
    res.json({ message: "Product updated", product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Delete product ───────────────────────────────────────────────────────────
router.delete("/delete/:id", protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    if (product.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await product.deleteOne();
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all products

router.get("/", async (req, res) => {
  try {
    const { category, minPrice, maxPrice } = req.query;
    const filter = {};

    if (category)            filter.category = category;
    if (minPrice || maxPrice) {
      filter.finalPrice = {};
      if (minPrice) filter.finalPrice.$gte = Number(minPrice);
      if (maxPrice) filter.finalPrice.$lte = Number(maxPrice);
    }

    const products = await Product.find(filter).populate("seller", "name");
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//Get single product
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("seller", "name email");

    if (!product || !product.isActive) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
