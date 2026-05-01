require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Order = require('./models/Order');

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const users = await User.find({});
  console.log('Users in DB:');
  users.forEach(u => console.log(`- ${u.name} (${u.email}) [${u.role}]`));
  
  const orders = await Order.find({}).populate('userId', 'name email');
  console.log('\nOrders in DB:');
  orders.forEach(o => console.log(`- Order ${o._id} | User: ${o.userId ? o.userId.email : 'None'} | Status: ${o.status}`));
  
  process.exit(0);
}
check();
