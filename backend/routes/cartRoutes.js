const express  = require('express');
const router   = express.Router();
const Cart     = require('../models/Cart');
const Product  = require('../models/Product');
const { protect } = require('../middleware/authMiddleware');

// Helper — re-fetch cart with populated product fields and return it
async function getPopulatedCart(userId) {
  return Cart.findOne({ user: userId })
    .populate('items.product', 'name image finalPrice stock isActive');
}

// ─── POST /api/cart/add/:productId ────────────────────────────────────────────
router.post('/add/:productId', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);

    if (!product || !product.isActive) {
      return res.status(404).json({ message: 'Product not found' });
    }
    if (product.stock <= 0) {
      return res.status(400).json({ message: 'Product is out of stock' });
    }

    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }

    const existingItem = cart.items.find(
      item => item.product.toString() === product._id.toString()
    );

    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        return res.status(400).json({
          message: `Only ${product.stock} unit(s) available`,
        });
      }
      existingItem.quantity += 1;
    } else {
      cart.items.push({ product: product._id, quantity: 1 });
    }

    await cart.save();

    // Re-fetch with populated fields so the response is complete
    const populated = await getPopulatedCart(req.user.id);
    res.json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/cart ────────────────────────────────────────────────────────────
router.get('/', protect, async (req, res) => {
  try {
    const cart = await getPopulatedCart(req.user.id);

    if (!cart) {
      return res.json({ user: req.user.id, items: [] });
    }

    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PUT /api/cart/update/:productId ──────────────────────────────────────────
router.put('/update/:productId', protect, async (req, res) => {
  try {
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    if (quantity > product.stock) {
      return res.status(400).json({
        message: `Only ${product.stock} unit(s) available`,
      });
    }

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const item = cart.items.find(
      i => i.product.toString() === req.params.productId
    );
    if (!item) {
      return res.status(404).json({ message: 'Item not in cart' });
    }

    item.quantity = quantity;
    await cart.save();

    const populated = await getPopulatedCart(req.user.id);
    res.json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── DELETE /api/cart/remove/:productId ───────────────────────────────────────
router.delete('/remove/:productId', protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter(
      item => item.product.toString() !== req.params.productId
    );

    await cart.save();

    const populated = await getPopulatedCart(req.user.id);
    res.json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── DELETE /api/cart/clear ───────────────────────────────────────────────────
router.delete('/clear', protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.json({ message: 'Cart already empty' });
    }

    cart.items = [];
    await cart.save();

    res.json({ message: 'Cart cleared', cart });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
