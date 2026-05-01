const Order = require('../models/Order');

exports.createOrder = async (req, res) => {
  const { products, address, totalAmount, paymentMethod, paymentId, userId } = req.body;
  try {
    if (!products || products.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }
    
    // Support guest checkout (no req.user)
    const orderUserId = req.user ? req.user._id : userId || 'guest';
    const customerEmail = req.user ? req.user.email : address.email || `${address.name.toLowerCase().replace(/\s+/g, '')}@example.com`;
    const customerName = req.user ? req.user.name : address.name || 'Guest';
    
    const order = new Order({
      userId: orderUserId,
      products,
      address,
      totalAmount,
      paymentMethod,
      paymentId
    });
    const createdOrder = await order.save();
    
    const io = req.app.get('io');
    if (io) {
      io.emit('newOrder', createdOrder);
    }
    
    const sendEmail = require('../utils/sendEmail');
    if (customerEmail && !customerEmail.endsWith('@example.com')) {
      const itemsList = products.map(p => `<li>${p.name} (x${p.qty}) - Rs. ${p.price * p.qty}</li>`).join('');
      sendEmail({
        email: customerEmail,
        subject: `ShopEZ - Order Confirmation (#${createdOrder._id})`,
        message: `Hello ${customerName},\n\nThank you for your order!\n\nOrder ID: ${createdOrder._id}\nTotal: Rs. ${totalAmount}\nPayment Method: ${paymentMethod}\n\nWe will notify you once it ships.`,
        html: `
          <div style="font-family: sans-serif; padding: 20px;">
            <h2>Order Confirmed! 🎉</h2>
            <p>Hello <strong>${customerName}</strong>,</p>
            <p>Thank you for shopping with ShopEZ. Your order has been placed successfully.</p>
            <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0 0 10px 0;"><strong>Order ID:</strong> #${createdOrder._id}</p>
              <p style="margin: 0 0 10px 0;"><strong>Total Amount:</strong> Rs. ${totalAmount}</p>
              <p style="margin: 0;"><strong>Payment Method:</strong> ${paymentMethod}</p>
            </div>
            <h3>Items Ordered:</h3>
            <ul>${itemsList}</ul>
            <p>We'll send you another email when your order ships.</p>
          </div>
        `
      }).catch(err => console.log('Order confirmation email failed:', err.message));
    }

    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.id }).sort({ createdAt: -1 });
    if (req.user._id.toString() !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view these orders' });
    }
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate('userId', 'id name email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('userId', 'name email');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const newStatus = req.body.status;
    const statuses = ['Processing', 'Shipped', 'Out for delivery', 'Delivered', 'Cancelled'];
    
    // Prevent backward transition
    const currentIndex = statuses.indexOf(order.status);
    const newIndex = statuses.indexOf(newStatus);
    
    if (order.status === 'Cancelled') {
      return res.status(400).json({ message: 'Cannot update a cancelled order' });
    }
    if (newStatus !== 'Cancelled' && newIndex < currentIndex) {
      return res.status(400).json({ message: 'Cannot move order status backwards' });
    }

    order.status = newStatus;
    
    const sendEmail = require('../utils/sendEmail');
    let otpMessage = '';
    let deliveryInfoHtml = '';

    if (newStatus === 'Out for delivery') {
      const { name: deliveryPersonName, phone: deliveryPersonPhone } = req.body.deliveryDetails || {};
      order.deliveryPersonName = deliveryPersonName;
      order.deliveryPersonPhone = deliveryPersonPhone;

      const otpGenerator = require('otp-generator');
      const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });
      order.deliveryOtp = otp;
      
      otpMessage = `\n\nDelivery Executive: ${deliveryPersonName || 'Not Assigned'} (Ph: ${deliveryPersonPhone || 'N/A'})\nYour Delivery Verification OTP is: ${otp}. Please share this with the delivery executive.`;
      
      deliveryInfoHtml = `
        <div style="margin-top: 15px; padding: 15px; border-left: 4px solid #2563eb; background: #f8fafc;">
          <h4 style="margin:0 0 8px 0; color: #1e293b;">Delivery Executive Details:</h4>
          <p style="margin:0; color: #475569;"><strong>Name:</strong> ${deliveryPersonName || 'Not Assigned'}</p>
          <p style="margin:0; color: #475569;"><strong>Phone:</strong> ${deliveryPersonPhone || 'N/A'}</p>
        </div>
        <div style="background-color: #f1f5f9; border-radius: 8px; padding: 15px; text-align: center; margin: 20px 0;">
          <p style="margin:0; color:#475569; font-size:14px;">Delivery Verification OTP</p>
          <span style="font-size: 28px; font-weight: 700; color: #0f172a; letter-spacing: 5px;">${order.deliveryOtp}</span>
        </div>
      `;
    }

    const updatedOrder = await order.save();

    // Emit real-time status update
    const io = req.app.get('io');
    if (io) {
      io.emit('orderStatusUpdated', updatedOrder);
    }

    // Send email notification to user
    const userEmail = order.userId.email;
    if (userEmail) {
      sendEmail({
        email: userEmail,
        subject: `ShopEZ - Order Status Updated to ${newStatus}`,
        message: `Hello ${order.userId.name},\n\nYour order ${order._id} status has been updated to: ${newStatus}.${otpMessage}\n\nThank you for shopping with ShopEZ!`,
        html: `
          <div style="font-family: sans-serif; padding: 20px;">
            <h2>Order Status Update</h2>
            <p>Hello <strong>${order.userId.name}</strong>,</p>
            <p>Your order (<strong>#${order._id}</strong>) status has been updated to: <strong style="color: #2563eb;">${newStatus}</strong>.</p>
            ${newStatus === 'Out for delivery' ? deliveryInfoHtml : ''}
            <p>Thank you for shopping with ShopEZ!</p>
          </div>
        `
      }).catch(err => console.log('Order status email failed:', err.message));
    }

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to cancel this order' });
    }

    if (order.status !== 'Processing') {
      return res.status(400).json({ message: 'Only orders in Processing status can be cancelled' });
    }

    order.status = 'Cancelled';
    const updatedOrder = await order.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('orderStatusUpdated', updatedOrder);
    }

    res.json({ message: 'Order cancelled successfully', order: updatedOrder });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
