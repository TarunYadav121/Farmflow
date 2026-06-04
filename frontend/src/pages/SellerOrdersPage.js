import { useState, useEffect } from 'react';
import './SellerOrdersPage.css';
import apiFetch from '../utils/apiFetch';

const STATUSES = ['Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

// Colour for each status badge
const STATUS_CLASS = {
  Confirmed: 'sop-badge--confirmed',
  Shipped:   'sop-badge--shipped',
  Delivered: 'sop-badge--delivered',
  Cancelled: 'sop-badge--cancelled',
};

function SellerOrdersPage() {
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  // Track which orders are being updated: { [orderId]: true }
  const [updating, setUpdating] = useState({});

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

  async function handleStatusChange(orderId, newStatus) {
    setUpdating(prev => ({ ...prev, [orderId]: true }));

    try {
      const res  = await apiFetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        body:   JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.message || 'Failed to update status');
        return;
      }

      // Update status in local state — no full reload needed
      setOrders(prev =>
        prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o)
      );
    } catch {
      alert('Could not update status. Check your connection.');
    } finally {
      setUpdating(prev => ({ ...prev, [orderId]: false }));
    }
  }

  const totalEarnings = orders.reduce(
    (sum, o) => sum + (o.price ?? 0) * (o.quantity ?? 1), 0
  );

  if (loading) return (
    <div className="sop-page">
      <div className="loading-block"><span className="spinner" />Loading orders…</div>
    </div>
  );
  if (error) return (
    <div className="sop-page"><p className="sop-state sop-state--error">{error}</p></div>
  );

  return (
    <div className="sop-page">
      <h2 className="sop-title">Customer Orders</h2>

      {/* Summary */}
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
                  <td className="sop-status-cell">
                    {/* Coloured badge shows current status */}
                    <span className={`sop-badge ${STATUS_CLASS[order.status] || ''}`}>
                      {order.status || 'Confirmed'}
                    </span>
                    {/* Dropdown to change status */}
                    <select
                      className="sop-status-select"
                      value={order.status || 'Confirmed'}
                      disabled={updating[order._id]}
                      onChange={e => handleStatusChange(order._id, e.target.value)}
                    >
                      {STATUSES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
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
