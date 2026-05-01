import React, { createContext, useContext, useState, useEffect } from 'react';
import { getOrders, createOrder as createOrderAPI, cancelUserOrder, SOCKET_URL } from '../services/api';
import { useAuth } from './AuthContext';
import { io } from 'socket.io-client';

const OrderContext = createContext(null);

export const OrderProvider = ({ children }) => {
  const { user } = useAuth();
  const [orders,        setOrders]        = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const fetchOrders = async () => {
    if (!user) return;
    setOrdersLoading(true);
    try {
      const data = await getOrders(user.id);
      setOrders(data);
    } catch (err) {
      console.error('Failed to fetch orders', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchOrders();
    else setOrders([]);

    // Initialize socket connection
    const socket = io(SOCKET_URL);
    
    socket.on('orderStatusUpdated', (updatedOrder) => {
      setOrders(prevOrders => 
        prevOrders.map(order => 
          (order.id === updatedOrder._id || order._id === updatedOrder._id) 
            ? { ...order, status: updatedOrder.status } 
            : order
        )
      );
    });

    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const placeOrder = async ({ items, total, address, paymentMethod, paymentId }) => {
    if (!user) return { success: false, error: "User not logged in" };
    try {
      const res = await createOrderAPI({ userId: user.id, items, total, address, paymentMethod, paymentId });
      if (res.success) {
        setOrders(prev => [res.order, ...prev]);
        return { success: true, order: res.order };
      } else {
        return { success: false, error: res.error };
      }
    } catch (err) {
      console.error('Failed to create order', err);
      return { success: false, error: "Failed to place order" };
    }
  };

  const cancelOrder = async (orderId) => {
    try {
      const res = await cancelUserOrder(orderId);
      if (res.success) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Cancelled' } : o));
        return { success: true };
      }
      return { success: false, error: res.error };
    } catch (err) {
      return { success: false, error: 'Failed to cancel order' };
    }
  };

  return (
    <OrderContext.Provider value={{ orders, ordersLoading, placeOrder, fetchOrders, cancelOrder }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => useContext(OrderContext);
