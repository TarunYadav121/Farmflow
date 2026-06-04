import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiFetch from '../utils/apiFetch';
import './CartPage.css';

function CartPage() {
  const [cart, setCart]       = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  // Per-item in-flight state: { [productId]: true }
  const [busy, setBusy]       = useState({});
  const navigate = useNavigate();

  async function loadCart() {
    try {
      const res  = await apiFetch('/api/cart');
      const data = await res.json();
      if (res.ok) setCart(data);
      else setError(data.message || 'Failed to load cart');
    } catch {
      setError('Could not reach server.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadCart(); }, []);

  //  Quantity change 
  async function handleQuantity(productId, newQty) {
    if (newQty < 1) return handleRemove(productId);

    setBusy(prev => ({ ...prev, [productId]: true }));
    try {
      const res  = await apiFetch(`/api/cart/update/${productId}`, {
        method: 'PUT',
        body:   JSON.stringify({ quantity: newQty }),
      });
      const data = await res.json();

      if (!res.ok) { alert(data.message || 'Could not update quantity'); return; }
      setCart(data);
    } catch {
      alert('Update failed. Try again.');
    } finally {
      setBusy(prev => ({ ...prev, [productId]: false }));
    }
  }

  //  Remove item 
  async function handleRemove(productId) {
    setBusy(prev => ({ ...prev, [productId]: true }));
    try {
      const res  = await apiFetch(`/api/cart/remove/${productId}`, { method: 'DELETE' });
      const data = await res.json();

      if (!res.ok) { alert(data.message || 'Could not remove item'); return; }
      setCart(data);
    } catch {
      alert('Remove failed. Try again.');
    } finally {
      setBusy(prev => ({ ...prev, [productId]: false }));
    }
  }

  // Clear entire cart 
  async function handleClear() {
    if (!window.confirm('Clear your entire cart?')) return;
    try {
      const res  = await apiFetch('/api/cart/clear', { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) setCart({ items: [] });
      else alert(data.message || 'Could not clear cart');
    } catch {
      alert('Clear failed. Try again.');
    }
  }

  // Checkout 
  // For a single-item checkout, reuse the existing PaymentPage flow
  // For multi-item, just show an info alert for now (payment gateway not built yet)
  function handleCheckout() {
    const items = cart.items.filter(i => i.product);
    if (items.length === 0) return;

    if (items.length === 1) {
      const item = items[0];
      navigate('/payment', {
        state: {
          productId: item.product._id,
          name:      item.product.name,
          price:     item.product.finalPrice,
          mrp:       item.product.mrp ?? item.product.finalPrice,
          discount:  item.product.discount ?? 0,
          image:     item.product.image,
        },
      });
    } else {
      alert('Multi-item checkout coming soon. Please buy items individually for now.');
    }
  }

  //  Grand total 
  const grandTotal = (cart.items || []).reduce(
    (sum, item) => sum + (item.product?.finalPrice ?? 0) * item.quantity, 0
  );

  //  Render 
  if (loading) {
    return (
      <div className="cp-page">
        <div className="loading-block"><span className="spinner" />Loading cart…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cp-page">
        <p style={{ color: '#c62828', padding: '24px 0' }}>{error}</p>
      </div>
    );
  }

  const items = cart.items || [];

  return (
    <div className="cp-page">
      <div className="cp-header">
        <h2 className="cp-title">My Cart</h2>
        {items.length > 0 && (
          <button className="cp-clear-btn" onClick={handleClear}>
            Clear Cart
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="cp-empty">
          <span>🛒</span>
          <p>Your cart is empty.</p>
          <button className="cp-shop-btn" onClick={() => navigate('/')}>
            Browse Products
          </button>
        </div>
      ) : (
        <>
          {/* Item list */}
          <div className="cp-list">
            {items.map(item => {
              const p          = item.product;
              const isBusy     = busy[p?._id];
              const maxStock   = p?.stock ?? 1;
              const lineTotal  = (p?.finalPrice ?? 0) * item.quantity;

              return (
                <div className="cp-item" key={p?._id || item._id}>

                  {/* Image */}
                  <div className="cp-item__img-wrap">
                    {p?.image
                      ? <img src={p.image} alt={p.name} className="cp-item__img" />
                      : <div className="cp-item__img-placeholder">🌿</div>
                    }
                  </div>

                  {/* Info */}
                  <div className="cp-item__info">
                    <p className="cp-item__name">{p?.name || '—'}</p>
                    <p className="cp-item__price">₹{p?.finalPrice?.toFixed(2)}</p>
                  </div>

                  {/* Quantity controls */}
                  <div className="cp-item__qty">
                    <button
                      className="cp-qty-btn"
                      onClick={() => handleQuantity(p._id, item.quantity - 1)}
                      disabled={isBusy}
                    >−</button>
                    <span className="cp-qty-val">{item.quantity}</span>
                    <button
                      className="cp-qty-btn"
                      onClick={() => handleQuantity(p._id, item.quantity + 1)}
                      disabled={isBusy || item.quantity >= maxStock}
                    >+</button>
                  </div>

                  {/* Line total */}
                  <p className="cp-item__total">₹{lineTotal.toFixed(2)}</p>

                  {/* Remove */}
                  <button
                    className="cp-item__remove"
                    onClick={() => handleRemove(p._id)}
                    disabled={isBusy}
                    title="Remove"
                  >
                    ✕
                  </button>

                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="cp-summary">
            <div className="cp-summary__row">
              <span>{items.length} item{items.length !== 1 ? 's' : ''}</span>
              <span className="cp-summary__total">₹{grandTotal.toFixed(2)}</span>
            </div>
            <button className="cp-checkout-btn" onClick={handleCheckout}>
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default CartPage;
