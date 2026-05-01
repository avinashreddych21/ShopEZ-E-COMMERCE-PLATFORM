# ShopEZ - Complete User Guide

Welcome to your new e-commerce platform! This guide covers everything you need to know about running the backend server, managing your store from the Admin panel, and what the customers see on the front end.

---

## 1. Running the Full Application

Your application is split into two parts: the **Backend** (Node.js/Express) and the **Frontend** (React). Both need to be running for the app to work.

### Step 1: Start the Backend (Database & APIs)
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd "c:\Users\Avinash Reddy\Downloads\shopez2\backend"
   ```
2. Start the server:
   ```bash
   node server.js
   ```
   *You should see "Server running on port 5000" and "MongoDB Connected".*

### Step 2: Start the Frontend (Website UI)
1. Open a **new** terminal and navigate to the main project folder:
   ```bash
   cd "c:\Users\Avinash Reddy\Downloads\shopez2"
   ```
2. Start the React app:
   ```bash
   npm start
   ```
   *This will automatically open `http://localhost:3000` in your browser.*

---

## 2. Managing the Admin Panel

The Admin Panel is where you control your entire store. To access it, click the **"Admin Login"** or **"Are you an Admin?"** link at the bottom of the normal login page.

### Dashboard Overview
When you log in, the Dashboard gives you a quick snapshot of your store's performance:
- **Total Revenue**: The total amount earned from all orders.
- **Total Orders**: The total number of orders placed.
- **Products**: How many products you currently have in your catalog.
- **Recent Orders**: A quick list of the latest 5 orders placed by customers.

### Adding & Managing Products
- **Add Product**: Click the "Add Product" tab. Fill in the product details, select a category, set the price and sale price, and upload an image from your desktop.
- **Manage Products**: Click the "Products" tab. Here you can see all your active products. You can **Edit** them (change price, update image, change description) or **Delete** them if they are out of stock or discontinued.

### Managing Banners
Banners are the large promotional sections on the Homepage.
- **Image Banners**: Upload a large promotional graphic (e.g., "Summer Sale!"). You can choose the **Size**:
  - *Default Grid*: Sits side-by-side with another banner.
  - *Full Width*: Spans the entire screen.
- **Product Showcase Banners**: Instead of an image, you can select specific products from your catalog (Hold Ctrl/Cmd to select multiple). These will display as a full-width scrolling carousel of products right on the homepage!

### Fulfilling Orders
Click the **Orders** tab to manage customer purchases.
- You can view the customer's name, address, ordered items, total price, and the **Payment Method**.
- If a customer pays via **UPI**, you will see a blue badge with their Transaction/Reference Number, which you can use to verify the payment in your bank app.
- **Update Status**: Use the dropdown menu to change an order's status from `Processing` -> `Shipped` -> `Delivered`.

---

## 3. The Customer Experience

This is what your buyers will see and how they use the app.

### Registration & Email Verification
1. A new customer clicks "Sign Up".
2. They enter their Name, Email, and Password.
3. Instead of logging in immediately, the system sends a **6-digit OTP** to their email address.
4. The customer must enter the OTP to verify their account before they can log in.

### Browsing & Buying
- **Homepage**: Customers are greeted by the Hero section, followed by your custom Banners (Image banners or Product Showcases).
- **Categories & Search**: They can filter products by category (Electronics, Footwear, etc.) or use the search bar.
- **Product Details**: Clicking a product shows its description, price, and reviews.
- **Cart**: They can add multiple items to their cart, adjust quantities, or remove items.

### Checkout & Payment
When a customer clicks "Checkout", they provide their shipping address and choose a payment method:
- **Cash on Delivery (COD)**: The order is placed immediately, and you collect cash upon delivery.
- **UPI Transfer**: The customer is shown a secure popup with a QR code linked to your UPI ID (`8446556759@ybl`). After scanning and paying, they must enter their 12-digit **Transaction ID** into the website to finalize the order.

### Order Tracking
Customers can click their profile icon and go to the **"My Orders"** page. Here, they can track the status of their orders in real-time as you update them from the Admin panel!
