# 🌿 FarmFlow Multi-Vendor Farm Produce Marketplace

FarmFlow is a full-stack MERN e-commerce application connecting local farmers (sellers) directly with buyers. Sellers list and manage their produce; buyers browse, add to cart, and place orders with delivery address selection.

---

## Features

### Buyer
- Register / login with role detection
- Browse all products with search and category filter
- Add to cart or buy directly
- Manage cart (quantity, remove, clear)
- Save and manage delivery addresses
- Place orders (Cash on Delivery)
- View order history with real-time status from seller

### Seller
- Register / login as seller
- Add, edit, and delete products (with image URL preview)
- View own product listings
- View incoming orders with buyer details
- Update order status: Confirmed → Shipped → Delivered / Cancelled
- Earnings and order count summary

### General
- JWT-based authentication (1-day expiry)
- Automatic session expiry handling (auto-logout on 401)
- Route protection — role-based access control
- Error boundary to prevent blank screens on crashes

---

## Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | React 18, React Router v6, CSS    |
| Backend   | Node.js, Express.js               |
| Database  | MongoDB, Mongoose                 |
| Auth      | JWT (jsonwebtoken), bcryptjs      |
| HTTP      | fetch API (custom `apiFetch` wrapper) |

---

## Folder Structure

```
FarmFlow/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Order.js
│   │   ├── Cart.js
│   │   └── Address.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── cartRoutes.js
│   │   └── addressRoutes.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── server.js
│   └── .env
│
└── frontend/
    └── src/
        ├── components/
        │   ├── Navbar.js
        │   ├── AddressForm.js
        │   └── ErrorBoundary.js
        ├── pages/
        │   ├── LoginPage.js
        │   ├── RegisterPage.js
        │   ├── BuyerPage.js
        │   ├── CartPage.js
        │   ├── PaymentPage.js
        │   ├── OrdersPage.js
        │   ├── AddressPage.js
        │   ├── SellerDashboard.js
        │   └── SellerOrdersPage.js
        ├── utils/
        │   └── apiFetch.js
        └── App.js
```

---

## Installation

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### 1. Clone the repository
```bash
git clone https://github.com/TarunYadav121/Farmflow
cd farmflow
```

### 2. Backend setup
```bash
cd backend
npm install
```

Create a `.env` file:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/farmflow
JWT_SECRET=your_secret_key_here
```

Start the backend:
```bash
npm run dev     # development (nodemon)
npm start       # production
```

### 3. Frontend setup
```bash
cd frontend
npm install
npm start
```

The React app runs on `http://localhost:3000` and proxies `/api` requests to `http://localhost:5000` automatically.

---

## Environment Variables

| Variable    | Description                          | Example                        |
|-------------|--------------------------------------|--------------------------------|
| `PORT`      | Backend server port                  | `5000`                         |
| `MONGO_URI` | MongoDB connection string            | `mongodb://localhost:27017/farmflow` |
| `JWT_SECRET`| Secret key for signing JWTs          | `supersecret123`               |

---

## API Summary

### Auth — `/api/auth`
| Method | Route       | Description            |
|--------|-------------|------------------------|
| POST   | `/register` | Register buyer/seller  |
| POST   | `/login`    | Login, returns JWT     |

### Products — `/api/products`
| Method | Route              | Access  | Description              |
|--------|--------------------|---------|--------------------------|
| GET    | `/`                | Public  | All products (filterable)|
| GET    | `/:id`             | Public  | Single product           |
| GET    | `/my-products`     | Seller  | Seller's own products    |
| POST   | `/add`             | Seller  | Add product              |
| PUT    | `/update/:id`      | Seller  | Edit own product         |
| DELETE | `/delete/:id`      | Seller  | Delete own product       |

### Orders — `/api/orders`
| Method | Route               | Access  | Description              |
|--------|---------------------|---------|--------------------------|
| POST   | `/:productId`       | Buyer   | Place order              |
| GET    | `/my-orders`        | Buyer   | Buyer's order history    |
| GET    | `/seller-orders`    | Seller  | Orders for seller's products |
| PUT    | `/:id/status`       | Seller  | Update order status      |

### Cart — `/api/cart`
| Method | Route                  | Access | Description         |
|--------|------------------------|--------|---------------------|
| GET    | `/`                    | Buyer  | Get cart            |
| POST   | `/add/:productId`      | Buyer  | Add item to cart    |
| PUT    | `/update/:productId`   | Buyer  | Update quantity     |
| DELETE | `/remove/:productId`   | Buyer  | Remove item         |
| DELETE | `/clear`               | Buyer  | Clear cart          |

### Addresses — `/api/addresses`
| Method | Route          | Access | Description           |
|--------|----------------|--------|-----------------------|
| GET    | `/`            | Buyer  | Get all addresses     |
| POST   | `/`            | Buyer  | Add new address       |
| PUT    | `/:id`         | Buyer  | Edit address          |
| DELETE | `/:id`         | Buyer  | Delete address        |
| PUT    | `/:id/default` | Buyer  | Set default address   |

---

## Future Improvements

- **File upload** — product images via Multer instead of URL strings
- **Real payment gateway** — Razorpay / Stripe integration for online payments
- **Multi-item checkout** — single order for all cart items
- **Pagination** — for products and order history
- **Product reviews & ratings**
- **Admin panel** — user management, product moderation
- **Order notifications** — email or push on status change
- **PWA support** — installable on mobile
- **Search suggestions** — autocomplete on product search
- **Password reset** — email-based forgot password flow
