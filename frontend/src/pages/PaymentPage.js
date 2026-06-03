import { useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import './PaymentPage.css';
import apiFetch from '../utils/apiFetch';

function PaymentPage() {
  const { state } = useLocation();
  const navigate  = useNavigate();
  const [loading, setLoading] = useState(false);

  // If someone lands here directly without product state, send them back
  if (!state?.productId) {
    return <Navigate to="/" replace />;
  }

  const { productId, name, price, mrp, discount, image } = state;
  const hasDiscount = discount > 0;

  async function handleCOD() {
    setLoading(true);
    try {
      const res  = await apiFetch(`/api/orders/${productId}`, {
        method: 'POST',
      });
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
      setLoading(false);
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
              {hasDiscount && (
                <span className="pp-product__mrp">₹{mrp}</span>
              )}
              <span className="pp-product__price">₹{price?.toFixed(2)}</span>
              {hasDiscount && (
                <span className="pp-product__saving">You save {discount}%</span>
              )}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="pp-divider" />

        {/* Total */}
        <div className="pp-total">
          <span>Total</span>
          <span className="pp-total__amount">₹{price?.toFixed(2)}</span>
        </div>

        {/* Payment options */}
        <p className="pp-section-label">Choose Payment Method</p>

        <div className="pp-options">

          {/* Cash on Delivery */}
          <button
            className="pp-option pp-option--cod"
            onClick={handleCOD}
            disabled={loading}
          >
            <span className="pp-option__icon">🚚</span>
            <div className="pp-option__text">
              <strong>Cash on Delivery</strong>
              <small>Pay when your order arrives</small>
            </div>
            <span className="pp-option__arrow">→</span>
          </button>

          {/* Pay Online */}
          <button
            className="pp-option pp-option--online"
            onClick={handleOnline}
            disabled={loading}
          >
            <span className="pp-option__icon">💳</span>
            <div className="pp-option__text">
              <strong>Pay Online</strong>
              <small>UPI, Cards, Net Banking</small>
            </div>
            <span className="pp-option__arrow">→</span>
          </button>

        </div>

        {/* Back link */}
        <button className="pp-back" onClick={() => navigate(-1)}>
          ← Back to Products
        </button>

      </div>
    </div>
  );
}

export default PaymentPage;
