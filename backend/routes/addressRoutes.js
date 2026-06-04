const express = require('express');
const router  = express.Router();
const Address = require('../models/Address');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected — user can only touch their own addresses
router.use(protect);

// ─── Validation helper ────────────────────────────────────────────────────────
function validateAddress({ fullName, phone, addressLine, city, state, pincode }) {
  if (!fullName?.trim())    return 'Full name is required';
  if (!phone?.trim())       return 'Phone number is required';
  if (!addressLine?.trim()) return 'Address line is required';
  if (!city?.trim())        return 'City is required';
  if (!state?.trim())       return 'State is required';
  if (!pincode?.trim())     return 'Pincode is required';
  if (!/^\d{6}$/.test(pincode.trim())) return 'Pincode must be 6 digits';
  return null;
}

// ─── POST /api/addresses — add new address ────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { fullName, phone, addressLine, city, state, pincode, isDefault } = req.body;

    const err = validateAddress({ fullName, phone, addressLine, city, state, pincode });
    if (err) return res.status(400).json({ message: err });

    // If this is being set as default, unset all others first
    if (isDefault) {
      await Address.updateMany({ user: req.user.id }, { isDefault: false });
    }

    // If this is the user's first address, make it default automatically
    const count = await Address.countDocuments({ user: req.user.id });
    const shouldBeDefault = isDefault || count === 0;

    const address = await Address.create({
      user: req.user.id,
      fullName:    fullName.trim(),
      phone:       phone.trim(),
      addressLine: addressLine.trim(),
      city:        city.trim(),
      state:       state.trim(),
      pincode:     pincode.trim(),
      isDefault:   shouldBeDefault,
    });

    res.status(201).json(address);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/addresses — get all addresses for logged-in user ────────────────
router.get('/', async (req, res) => {
  try {
    // Default address first, then newest first
    const addresses = await Address.find({ user: req.user.id })
      .sort({ isDefault: -1, createdAt: -1 });

    res.json(addresses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PUT /api/addresses/:id — update address ──────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, user: req.user.id });
    if (!address) return res.status(404).json({ message: 'Address not found' });

    const { fullName, phone, addressLine, city, state, pincode, isDefault } = req.body;

    const err = validateAddress({
      fullName:    fullName    ?? address.fullName,
      phone:       phone       ?? address.phone,
      addressLine: addressLine ?? address.addressLine,
      city:        city        ?? address.city,
      state:       state       ?? address.state,
      pincode:     pincode     ?? address.pincode,
    });
    if (err) return res.status(400).json({ message: err });

    if (isDefault) {
      await Address.updateMany({ user: req.user.id }, { isDefault: false });
    }

    address.fullName    = fullName?.trim()    ?? address.fullName;
    address.phone       = phone?.trim()       ?? address.phone;
    address.addressLine = addressLine?.trim() ?? address.addressLine;
    address.city        = city?.trim()        ?? address.city;
    address.state       = state?.trim()       ?? address.state;
    address.pincode     = pincode?.trim()     ?? address.pincode;
    address.isDefault   = isDefault           ?? address.isDefault;

    await address.save();
    res.json(address);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── DELETE /api/addresses/:id — delete address ───────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, user: req.user.id });
    if (!address) return res.status(404).json({ message: 'Address not found' });

    await address.deleteOne();

    // If the deleted address was default, make the most recent one default
    if (address.isDefault) {
      const next = await Address.findOne({ user: req.user.id }).sort({ createdAt: -1 });
      if (next) { next.isDefault = true; await next.save(); }
    }

    res.json({ message: 'Address deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PUT /api/addresses/:id/default — set as default ─────────────────────────
router.put('/:id/default', async (req, res) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, user: req.user.id });
    if (!address) return res.status(404).json({ message: 'Address not found' });

    // Unset all, then set this one
    await Address.updateMany({ user: req.user.id }, { isDefault: false });
    address.isDefault = true;
    await address.save();

    // Return full updated list
    const addresses = await Address.find({ user: req.user.id })
      .sort({ isDefault: -1, createdAt: -1 });

    res.json(addresses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
