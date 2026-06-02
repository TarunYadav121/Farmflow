const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  try {
    let token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ message: "No token, access denied" });
    }

    if (token.startsWith("Bearer ")) {
      token = token.split(" ")[1];
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};
const isSeller = (req, res, next) => {
    try {
        if (req.user.role !== "seller") {
    return res.status(403).json({ message: "Seller access only" });
  }
  next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
};


module.exports = { protect, isSeller };