require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Order = require('./models/Order');

async function wipe() {
  await mongoose.connect(process.env.MONGO_URI);
  
  // Wipe all orders
  const delOrders = await Order.deleteMany({});
  console.log(`Deleted ${delOrders.deletedCount} orders.`);
  
  // Wipe all users
  const delUsers = await User.deleteMany({});
  console.log(`Deleted ${delUsers.deletedCount} users.`);

  process.exit(0);
}
wipe();
