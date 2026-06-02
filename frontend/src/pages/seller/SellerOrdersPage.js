import React, { useEffect, useState } from 'react';
import { fetchSellerOrders } from '../../api/sellerApi';
import { updateOrderStatus } from '../../api/orderApi';
import { toast } from 'react-toastify';

const STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

const SellerOrdersPage = () => {
  const [orders, setOrders] = useState([]);

  const load = () => {
    fetchSellerOrders().then((res) => setOrders(res.data)).catch(console.error);
  };

  useEffect(load, []);

  const handleStatusChange = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, status);
      toast.success('Order status updated');
      load();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  if (orders.length === 0) return <p>No orders yet.</p>;

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>Customer Orders</h2>
      {orders.map((order) => (
        <div key={order._id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 20, marginBottom: 20, background: 'white' }}>
          <p style={{ fontWeight: 600, marginBottom: 8 }}>Order #{order._id.slice(-8).toUpperCase()}</p>
          <p style={{ color: '#555', marginBottom: 4 }}>Buyer: {order.buyer?.name}</p>
          {order.items.map((item, i) => (
            <p key={i} style={{ color: '#555' }}>{item.name} × {item.quantity}</p>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
            <label>Status:</label>
            <select
              value={order.status}
              onChange={(e) => handleStatusChange(order._id, e.target.value)}
              style={{ padding: '6px 10px', borderRadius: 4, border: '1px solid #ccc' }}
            >
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SellerOrdersPage;
