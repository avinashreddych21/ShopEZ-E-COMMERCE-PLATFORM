require('dotenv').config();
const mongoose = require('mongoose');
require('./models/User');
const Order = require('./models/Order');

async function migrate() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const orders = await Order.find({});
  let updated = 0;
  for (let order of orders) {
    let modified = false;
    for (let product of order.products) {
      if (!product.createdBy) {
        product.createdBy = 'admin0000@gmail.com';
        modified = true;
      }
    }
    if (modified) {
      await order.save();
      updated++;
    }
  }
  console.log(`Updated ${updated} orders to include createdBy.`);
  process.exit(0);
}
migrate();
