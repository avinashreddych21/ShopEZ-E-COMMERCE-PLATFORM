<h1 align="center">ShopEZ - E-Commerce Platform</h1>

<p align="center">
  A fully featured, full-stack E-Commerce web application built with the MERN stack (MongoDB, Express, React, Node.js). ShopEZ provides a seamless shopping experience for customers and a comprehensive admin dashboard for store management.
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#installation">Installation</a> •
  <a href="#usage">Usage</a>
</p>

---

## ✨ Features

### 🛒 Customer Experience
* **Secure Authentication**: User registration and login with Email OTP verification.
* **Product Catalog**: Browse products by category, view detailed product pages, and search for specific items.
* **Dynamic Homepage**: Features promotional image banners and scrolling product showcases.
* **Shopping Cart**: Add items to the cart, adjust quantities, and manage selections seamlessly.
* **Checkout & Payment**: Supports both Cash on Delivery (COD) and UPI payments with transaction ID verification.
* **Order Tracking**: Real-time order status tracking (Processing, Shipped, Delivered) directly from the user profile.
* **Invoices**: Automatically generated order invoices via PDF.

### ⚙️ Admin Dashboard
* **Analytics**: Visual dashboard displaying total revenue, orders, product count, and recent activity using interactive charts.
* **Product Management**: Full CRUD capabilities for adding, updating, and removing products, including image uploads and sale pricing.
* **Banner Management**: Customize homepage promotions with full-width or grid image banners, and product carousels.
* **Order Fulfillment**: View comprehensive order details, verify UPI transactions, and update order statuses to keep customers informed.

## 🛠️ Tech Stack

**Frontend**
* [React 18](https://reactjs.org/)
* [Vite](https://vitejs.dev/) - Lightning-fast build tool
* [React Router v6](https://reactrouter.com/) - Navigation and routing
* [Recharts](https://recharts.org/) - Dashboard analytics
* [Socket.io-client](https://socket.io/) - Real-time updates
* [Axios](https://axios-http.com/) - API requests
* [jsPDF](https://parall.ax/products/jspdf) & [html2canvas](https://html2canvas.hertzen.com/) - Invoice generation

**Backend**
* [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/) - Server environment & framework
* [MongoDB](https://www.mongodb.com/) & [Mongoose](https://mongoosejs.com/) - Database and Object Data Modeling
* [JSON Web Token (JWT)](https://jwt.io/) & [Bcrypt.js](https://www.npmjs.com/package/bcryptjs) - Security & authentication
* [Nodemailer](https://nodemailer.com/) - Email & OTP services
* [Socket.io](https://socket.io/) - Real-time bidirectional event-based communication
* [Twilio](https://www.twilio.com/) - SMS integration capabilities

## 🚀 Installation

To run this project locally, follow these steps:

### Prerequisites
* [Node.js](https://nodejs.org/) (v16 or higher)
* [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas)
* Git

### 1. Clone the repository
```bash
git clone https://github.com/avinashreddych21/ShopEZ-E-COMMERCE-PLATFORM.git
cd ShopEZ-E-COMMERCE-PLATFORM
```

### 2. Setup the Backend
Open a terminal in the `Backend` directory:
```bash
cd Backend
npm install
```
Create a `.env` file in the `Backend` directory and configure the necessary environment variables (e.g., `MONGO_URI`, `JWT_SECRET`, `EMAIL_USER`, `EMAIL_PASS`).

Start the backend server:
```bash
npm start
```
*The server will run on port 5000.*

### 3. Setup the Frontend
Open a new terminal in the `Frontend` directory:
```bash
cd Frontend
npm install
```

Start the frontend development server:
```bash
npm run start
```
*The React app will open at `http://localhost:5173` (Vite's default port) or `http://localhost:3000`.*

## 📖 Usage

* **Customer Portal**: Access the main application via the frontend URL. New users must register and verify their email via OTP before purchasing.
* **Admin Portal**: Navigate to the "Admin Login" link. Admins have complete control over the product catalog, promotional banners, and order statuses.

---

<p align="center">
  <i>Developed with ❤️ by CH AVINASH REDDY</i>
</p>
