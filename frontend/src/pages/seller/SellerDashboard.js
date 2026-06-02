import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchSellerDashboard } from '../../api/sellerApi';

const SellerDashboard = () => {
  const [stats, setStats] = useState({ totalProducts: 0, totalOrders: 0, totalRevenue: 0 });

  useEffect(() => {
    fetchSellerDashboard().then((res) => setStats(res.data)).catch(console.error);
  }, []);

  const cards = [
    { label: 'Total Products', value: stats.totalProducts },
    { label: 'Total Orders', value: stats.totalOrders },
    { label: 'Total Revenue', value: `$${stats.totalRevenue.toFixed(2)}` },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>Seller Dashboard</h2>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20, marginBottom: 32 }}>
        {cards.map((card) => (
          <div key={card.label} style={{ background: 'white', padding: 24, borderRadius: 8, border: '1px solid #ddd', textAlign: 'center' }}>
            <p style={{ fontSize: '2rem', fontWeight: 700, color: '#2e7d32' }}>{card.value}</p>
            <p style={{ color: '#666' }}>{card.label}</p>
          </div>
        ))}
      </div>
      {/* Quick links */}
      <div style={{ display: 'flex', gap: 12 }}>
        <Link to="/seller/products" style={linkBtnStyle}>Manage Products</Link>
        <Link to="/seller/products/add" style={linkBtnStyle}>+ Add Product</Link>
        <Link to="/seller/orders" style={linkBtnStyle}>View Orders</Link>
      </div>
    </div>
  );
};

const linkBtnStyle = {
  background: '#2e7d32', color: 'white', padding: '10px 20px',
  borderRadius: 4, fontWeight: 600,
};

export default SellerDashboard;
