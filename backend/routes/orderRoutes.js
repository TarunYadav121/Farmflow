const express = require('express');
const router  = express.Router();
const Order   = require('../models/Order');
const Product = require('../models/Product');
const { protect } = require('../middleware/authMiddleware');

const ALLOWED_STATUSES = ['Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

//place an order 
router.post('/:productId', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);

    if (!product || !product.isActive) {
      return res.status(404).json({ message: 'Product not found' });
    }
    if (product.stock <= 0) {
      return res.status(400).json({ message: 'Out of stock' });
    }

    product.stock -= 1;
    await product.save();

    const order = await Order.create({
      user:     req.user.id,
      product:  product._id,
      price:    product.finalPrice,
      quantity: 1,
    });

    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//buyer's own orders 
router.get('/my-orders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('product', 'name image category')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// orders for this seller's products
router.get('/seller-orders', protect, async (req, res) => {
  try {
    const sellerProducts = await Product.find(
      { seller: req.user.id },
      '_id'
    );

    if (sellerProducts.length === 0) {
      return res.json([]);
    }

    const productIds = sellerProducts.map(p => p._id);

    const orders = await Order.find({ product: { $in: productIds } })
      .populate('product', 'name')
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// update order status — seller only, must own the product
router.put('/:orderId/status', protect, async (req, res) => {
  try {
    const { status } = req.body;

    // Validate the incoming status value
    if (!status || !ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Allowed: ${ALLOWED_STATUSES.join(', ')}`,
      });
    }

    // Load the order and populate product so we can check seller ownership
    const order = await Order.findById(req.params.orderId)
      .populate('product', 'seller');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Only the seller who owns the product can update the status
    if (order.product.seller.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this order' });
    }

    order.status = status;
    await order.save();

    res.json({ message: 'Order status updated', order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
