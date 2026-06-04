const mongoose = require('mongoose');

const STATUSES = ['Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: STATUSES,
      default: 'Confirmed',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
