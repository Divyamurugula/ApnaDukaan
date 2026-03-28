# ApnaDukaan 🛒
### Empowering Local Retail through AI-Driven Commerce

A full-stack MERN e-commerce platform for local grocery stores with AI chatbot (LangChain), PayPal payments, and role-based dashboards.

---

## 🏗️ Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18, Tailwind CSS, React Router v6 |
| Backend   | Node.js, Express.js                 |
| Database  | MongoDB Atlas (Mongoose)            |
| Auth      | JWT (JSON Web Tokens) + bcryptjs    |
| Payments  | PayPal Sandbox                      |
| AI        | LangChain + OpenAI GPT-3.5          |
| Deployment| Render (Backend), Vercel (Frontend) |

---

## 📁 Folder Structure

```
ApnaDukaan/
├── backend/
│   ├── config/         # DB connection
│   ├── controllers/    # Business logic
│   ├── middleware/      # Auth middleware
│   ├── models/         # Mongoose schemas
│   ├── routes/         # Express routes
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── public/
    └── src/
        ├── components/
        │   └── common/ # Navbar, Footer, ProductCard, ShopCard, ChatBot, etc.
        ├── context/    # AuthContext, CartContext
        ├── pages/
        │   ├── customer/   # Home, Shops, Cart, Checkout, Orders, Profile, Wishlist
        │   ├── shopkeeper/ # Dashboard, Products, Orders, Inventory, Profile
        │   ├── admin/      # Dashboard, Users, Orders, Payments, Reports
        │   └── delivery/   # Dashboard, MyDeliveries
        ├── utils/      # Axios API instance
        ├── App.jsx
        └── index.js
```

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- PayPal Developer account (Sandbox)
- OpenAI API key

---

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Fill in your environment variables in .env
npm run dev
```

**Required `.env` values:**
```
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_secret_key
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
OPENAI_API_KEY=...
FRONTEND_URL=http://localhost:3000
```

---

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

The app opens at `http://localhost:3000` and proxies API calls to `http://localhost:5000`.

---

## 👥 User Roles

| Role        | Access                                          |
|-------------|--------------------------------------------------|
| Customer    | Browse shops/products, cart, checkout, orders, wishlist, AI chat |
| Shopkeeper  | Dashboard, manage products, orders, inventory, shop profile |
| Admin       | Full platform oversight, users, reports, payments |
| Delivery    | View & accept deliveries, update delivery status |

---

## 🔑 API Endpoints

| Module    | Endpoints                                         |
|-----------|---------------------------------------------------|
| Auth      | POST /register, POST /login, GET /me, PUT /profile |
| Shops     | GET /, GET /:id, POST /, PUT /:id, GET /my        |
| Products  | GET /, GET /featured, GET /:id, POST /, PUT /:id  |
| Orders    | POST /, GET /my, GET /shop, PUT /:id/status        |
| Payments  | POST /paypal/create, POST /paypal/execute, POST /cod |
| Delivery  | GET /available, PUT /:id/accept, PUT /:id/status  |
| Inventory | GET /shop/:id, PUT /:id, GET /low-stock/:id       |
| Chatbot   | POST /chat, GET /recommendations                  |
| Admin     | GET /stats, GET /users, GET /orders, GET /payments, GET /reports/sales |

---

## 🗃️ Database Schema

- **User** — name, email, password (hashed), role, address, wishlist
- **Shop** — shopName, shopkeeper (ref), category, location (geo), rating
- **Product** — productName, price, discountedPrice, category, shop, stock, reviews
- **Order** — customer, shop, items[], deliveryAddress, totalAmount, status history
- **Payment** — order, paymentMethod, amount, paymentStatus, transactionId
- **Delivery** — order, deliveryPartner, deliveryStatus, verificationCode
- **Inventory** — product, shop, quantity, lowStockThreshold, history[]
- **Category** — name, description

---

## ✨ Key Features

- 🤖 **AI Chatbot** — LangChain + GPT-3.5 powered shopping assistant
- 📍 **Location-based shops** — Geo-indexed shop discovery
- 🛒 **Single-shop cart** — Enforces cart from one shop at a time
- 💳 **PayPal + COD** — Dual payment gateway support
- 📦 **Order tracking** — Real-time status timeline
- 📊 **Admin analytics** — Revenue reports, top products, order breakdown
- ⚠️ **Low-stock alerts** — Automated inventory notifications
- ⭐ **Reviews & ratings** — For both products and shops

---

## 📦 Deployment

### Backend (Render)
1. Create a new Web Service on Render
2. Connect your GitHub repo
3. Set build command: `npm install`
4. Set start command: `node server.js`
5. Add all environment variables from `.env.example`

### Frontend (Vercel)
1. Import frontend folder to Vercel
2. Set `REACT_APP_API_URL=https://your-backend.onrender.com/api`
3. Deploy

---

## 👨‍💻 Team
- 23BQ1A05E8 — Murugula Divya
- 23BQ1A05F8 — Neelisetty Hema Siri
- 23BQ1A05H7 — Perungulam Kanaka Laya Sadhana
- 23BQ1A05F0 — Myla Sai Harshith
