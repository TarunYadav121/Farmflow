const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();


app.use(cors());
app.use(express.json());


mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB error:', err));


app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require("./routes/productRoutes"));


app.get('/', (req, res) => {
  res.json({ message: 'FarmFlow API is running' });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));