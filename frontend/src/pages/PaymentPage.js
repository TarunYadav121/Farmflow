import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import apiFetch from '../utils/apiFetch';
import AddressForm from '../components/AddressForm';
import './PaymentPage.css';

function PaymentPage() {
  const { state } = useLocation();
  const navigate  = useNavigate();

  const [addresses, setAddresses]       = useState([]);
  const [selectedAddr, setSelectedAddr] = useState(null); // address _id
  const [addrLoading, setAddrLoading]   = useState(true);
  const [showAddForm, setShowAddForm]   = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);

  // If someone lands here directly without product state, send them back
  if (!state?.productId) {
    return <Navigate to="/" replace />;
  }

  const { productId, name, price, mrp, discount, image } = state;
  const hasDiscount = discount > 0;

  // Load saved addresses on mount
  useEffect(() => {
    apiFetch('/api/addresses')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAddresses(data);
          // Pre-select default address
          const def = data.find(a => a.isDefault);
          if (def) setSelectedAddr(def._id);
          else if (data.length > 0) setSelectedAddr(data[0]._id);
        }
      })
      .catch(() => {})
      .finally(() => setAddrLoading(false));
  }, []);

  function handleAddressSaved(saved) {
    // Reload addresses and select the newly saved one
    apiFetch('/api/addresses')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAddresses(data);
          setSelectedAddr(saved._id);
        }
      });
    setShowAddForm(false);
  }

  async function handleCOD() {
    if (!selectedAddr) {
      alert('Please select a delivery address before placing the order.');
      return;
    }
    setOrderLoading(true);
    try {
      const res  = await apiFetch(`/api/orders/${productId}`, { method: 'POST' });
      const data = await res.json();

      if (!res.ok) {
        alert(data.message || 'Order failed. Please try again.');
        return;
      }

      alert('Order placed successfully!');
      navigate('/orders');
    } catch {
      alert('Could not place order. Check your connection.');
    } finally {
      setOrderLoading(false);
    }
  }

  function handleOnline() {
    alert('Online payment coming soon!');
  }

  return (
    <div className="pp-wrap">
      <div className="pp-card">

        {/* Header */}
        <h2 className="pp-title">Checkout</h2>

        {/* Product summary */}
        <div className="pp-product">
          <div className="pp-product__img-wrap">
            {image
              ? <img src={image} alt={name} className="pp-product__img" />
              : <div className="pp-product__img-placeholder">🌿</div>
            }
          </div>
          <div className="pp-product__info">
            <p className="pp-product__name">{name}</p>
            <div className="pp-product__pricing">
              {hasDiscount && <span className="pp-product__mrp">₹{mrp}</span>}
              <span className="pp-product__price">₹{price?.toFixed(2)}</span>
              {hasDiscount && (
                <span className="pp-product__saving">You save {discount}%</span>
              )}
            </div>
          </div>
        </div>

        <div className="pp-divider" />

        {/* Total */}
        <div className="pp-total">
          <span>Total</span>
          <span className="pp-total__amount">₹{price?.toFixed(2)}</span>
        </div>

        <div className="pp-divider" />

        {/* Delivery Address  */}
        <div className="pp-addr-section">
          <div className="pp-addr-header">
            <p className="pp-section-label">Delivery Address</p>
            <button
              className="pp-addr-add-btn"
              onClick={() => setShowAddForm(v => !v)}
            >
              {showAddForm ? 'Cancel' : '+ Add New'}
            </button>
          </div>

          {/* Inline add address form */}
          {showAddForm && (
            <div className="pp-addr-form-wrap">
              <AddressForm
                onSave={handleAddressSaved}
                onCancel={() => setShowAddForm(false)}
                submitLabel="Save & Use This Address"
              />
            </div>
          )}

          {/* Address list */}
          {addrLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', color: '#999', fontSize: '0.88rem' }}>
              <span className="spinner" /> Loading addresses…
            </div>
          ) : addresses.length === 0 && !showAddForm ? (
            <p className="pp-addr-empty">
              No saved addresses. Add one above to continue.
            </p>
          ) : (
            <div className="pp-addr-list">
              {addresses.map(addr => (
                <label
                  key={addr._id}
                  className={`pp-addr-card ${selectedAddr === addr._id ? 'pp-addr-card--selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="address"
                    value={addr._id}
                    checked={selectedAddr === addr._id}
                    onChange={() => setSelectedAddr(addr._id)}
                    className="pp-addr-radio"
                  />
                  <div className="pp-addr-info">
                    <p className="pp-addr-name">
                      {addr.fullName}
                      {addr.isDefault && <span className="pp-addr-default-badge">Default</span>}
                    </p>
                    <p className="pp-addr-detail">{addr.addressLine}</p>
                    <p className="pp-addr-detail">
                      {addr.city}, {addr.state} – {addr.pincode}
                    </p>
                    <p className="pp-addr-phone">📞 {addr.phone}</p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="pp-divider" />

        {/* Payment options */}
        <p className="pp-section-label" style={{ marginTop: 4 }}>Payment Method</p>

        <div className="pp-options">
          {/* Cash on Delivery */}
          <button
            className="pp-option pp-option--cod"
            onClick={handleCOD}
            disabled={orderLoading || !selectedAddr}
          >
            <span className="pp-option__icon">{orderLoading ? '' : '🚚'}</span>
            <div className="pp-option__text">
              {orderLoading ? (
                <div className="pp-option__loading">
                  <span className="spinner" />
                  <strong>Placing order…</strong>
                </div>
              ) : (
                <>
                  <strong>Cash on Delivery</strong>
                  <small>Pay when your order arrives</small>
                </>
              )}
            </div>
            {!orderLoading && <span className="pp-option__arrow">→</span>}
          </button>

          {/* Pay Online */}
          <button
            className="pp-option pp-option--online"
            onClick={handleOnline}
            disabled={orderLoading}
          >
            <span className="pp-option__icon">💳</span>
            <div className="pp-option__text">
              <strong>Pay Online</strong>
              <small>UPI, Cards, Net Banking</small>
            </div>
            <span className="pp-option__arrow">→</span>
          </button>
        </div>

        <button className="pp-back" onClick={() => navigate(-1)}>
          ← Back
        </button>

      </div>
    </div>
  );
}

export default PaymentPage;
