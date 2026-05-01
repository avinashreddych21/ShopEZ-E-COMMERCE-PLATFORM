const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: String, ref: 'User' },
  products: [
    {
      productId: { type: String, required: true },
      name: { type: String, required: true },
      qty: { type: Number, required: true },
      price: { type: Number, required: true },
      createdBy: { type: String }
    }
  ],
  totalAmount: { type: Number, required: true },
  address: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
  },
  status: { 
    type: String, 
    enum: ['Processing', 'Shipped', 'Out for delivery', 'Delivered', 'Cancelled'], 
    default: 'Processing' 
  },
  paymentMethod: { type: String, default: 'COD' },
  paymentId: { type: String },
  deliveryOtp: { type: String },
  deliveryPersonName: { type: String },
  deliveryPersonPhone: { type: String },
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
