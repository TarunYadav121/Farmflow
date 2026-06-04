import { useState, useEffect } from 'react';
import './OrdersPage.css';
import apiFetch from '../utils/apiFetch';

// Maps status value → CSS modifier class
const STATUS_CLASS = {
  Confirmed: 'op-badge--confirmed',
  Shipped:   'op-badge--shipped',
  Delivered: 'op-badge--delivered',
  Cancelled: 'op-badge--cancelled',
};

function OrdersPage() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    apiFetch('/api/orders/my-orders')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setOrders(data);
        else setError(data.message || 'Failed to load orders');
      })
      .catch(() => setError('Could not reach server.'))
      .finally(() => setLoading(false));
  }, []);

  // Total spent
  const totalSpent = orders.reduce((sum, o) => sum + (o.price ?? 0) * (o.quantity ?? 1), 0);

  if (loading) return (
    <div className="op-page">
      <div className="loading-block"><span className="spinner" />Loading orders…</div>
    </div>
  );
  if (error) return (
    <div className="op-page"><p className="op-state op-state--error">{error}</p></div>
  );

  return (
    <div className="op-page">
      <h2 className="op-title">My Orders</h2>

      {orders.length === 0 ? (
        <div className="op-empty">
          <span>🛒</span>
          <p>No orders yet. Browse products and place your first order!</p>
        </div>
      ) : (
        <>
          {/*Summary */}
          <div className="op-summary">
            <div className="op-stat">
              <span className="op-stat__label">Total Orders</span>
              <span className="op-stat__value">{orders.length}</span>
            </div>
            <div className="op-stat op-stat--spent">
              <span className="op-stat__label">Total Spent</span>
              <span className="op-stat__value">₹{totalSpent.toFixed(2)}</span>
            </div>
          </div>

          <div className="op-table-wrap">
            <table className="op-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price Paid</th>
                  <th>Qty</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, i) => (
                  <tr key={order._id}>
                    <td className="op-num">{i + 1}</td>
                    <td className="op-name">{order.product?.name || '—'}</td>
                    <td className="op-cat">{order.product?.category || '—'}</td>
                    <td className="op-price">₹{order.price?.toFixed(2)}</td>
                    <td>{order.quantity}</td>
                    <td>
                      <span className={`op-badge ${STATUS_CLASS[order.status] || 'op-badge--confirmed'}`}>
                        {order.status || 'Confirmed'}
                      </span>
                    </td>
                    <td className="op-date">
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
        </>
      )}
    </div>
  );
}

export default OrdersPage;
