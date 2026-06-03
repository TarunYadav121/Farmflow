import { useState, useEffect } from 'react';
import './SellerOrdersPage.css';
import apiFetch from '../utils/apiFetch';

function SellerOrdersPage() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    apiFetch('/api/orders/seller-orders')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setOrders(data);
        else setError(data.message || 'Failed to load orders');
      })
      .catch(() => setError('Could not reach server.'))
      .finally(() => setLoading(false));
  }, []);

  // Total earnings — sum of price * quantity across all orders
  const totalEarnings = orders.reduce((sum, o) => sum + (o.price ?? 0) * (o.quantity ?? 1), 0);

  if (loading) return <div className="sop-page"><p className="sop-state">Loading orders…</p></div>;
  if (error)   return <div className="sop-page"><p className="sop-state sop-state--error">{error}</p></div>;

  return (
    <div className="sop-page">
      <h2 className="sop-title">Customer Orders</h2>

      {/* Earnings summary  */}
      <div className="sop-summary">
        <div className="sop-stat">
          <span className="sop-stat__label">Total Orders</span>
          <span className="sop-stat__value">{orders.length}</span>
        </div>
        <div className="sop-stat sop-stat--earnings">
          <span className="sop-stat__label">Total Earnings</span>
          <span className="sop-stat__value">₹{totalEarnings.toFixed(2)}</span>
        </div>
      </div>

      {/* Empty state  */}
      {orders.length === 0 ? (
        <div className="sop-empty">
          <span>📋</span>
          <p>No orders yet. Orders will appear here once buyers purchase your products.</p>
        </div>
      ) : (
        <div className="sop-table-wrap">
          <table className="sop-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Product Name</th>
                <th>Buyer Name</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, i) => (
                <tr key={order._id}>
                  <td className="sop-num">{i + 1}</td>
                  <td className="sop-product">{order.product?.name || '—'}</td>
                  <td className="sop-buyer">{order.user?.name || '—'}</td>
                  <td className="sop-price">₹{order.price?.toFixed(2)}</td>
                  <td>{order.quantity}</td>
                  <td><span className="sop-badge">Confirmed</span></td>
                  <td className="sop-date">
                    {new Date(order.createdAt).toLocaleString('en-IN', {
                      day: '2-digit', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default SellerOrdersPage;
