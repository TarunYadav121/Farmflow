import React, { useEffect, useState } from 'react';
import { fetchMyOrders } from '../../api/orderApi';

const statusColors = {
  pending: '#f57c00',
  confirmed: '#1976d2',
  shipped: '#7b1fa2',
  delivered: '#2e7d32',
  cancelled: '#c62828',
};

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchMyOrders().then((res) => setOrders(res.data)).catch(console.error);
  }, []);

  if (orders.length === 0) return <p>No orders yet.</p>;

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>My Orders</h2>
      {orders.map((order) => (
        <div
          key={order._id}
          style={{ border: '1px solid #ddd', borderRadius: 8, padding: 20, marginBottom: 20, background: 'white' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <p style={{ fontWeight: 600 }}>Order #{order._id.slice(-8).toUpperCase()}</p>
            <span style={{ color: statusColors[order.status] || '#333', fontWeight: 600 }}>
              {order.status.toUpperCase()}
            </span>
          </div>
          {order.items.map((item, i) => (
            <p key={i} style={{ color: '#555' }}>
              {item.name} × {item.quantity} — ${(item.price * item.quantity).toFixed(2)}
            </p>
          ))}
          <p style={{ marginTop: 12, fontWeight: 700 }}>Total: ${order.totalPrice.toFixed(2)}</p>
          <p style={{ color: '#888', fontSize: '0.85rem' }}>
            Placed on {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  );
};

export default MyOrdersPage;
