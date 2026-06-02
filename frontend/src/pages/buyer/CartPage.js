import React from 'react';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';

const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity, totalPrice } = useCart();
  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <h2>Your cart is empty</h2>
        <button onClick={() => navigate('/products')} style={btnStyle}>
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <h2 style={{ marginBottom: 24 }}>Your Cart</h2>
      {cartItems.map((item) => (
        <div
          key={item._id}
          style={{ display: 'flex', gap: 16, alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: 16, marginBottom: 16 }}
        >
          <img
            src={item.images?.[0] || '/placeholder.png'}
            alt={item.name}
            style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 4 }}
          />
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 600 }}>{item.name}</p>
            <p style={{ color: '#2e7d32' }}>${item.price}</p>
          </div>
          <input
            type="number"
            value={item.quantity}
            min={1}
            onChange={(e) => updateQuantity(item._id, Number(e.target.value))}
            style={{ width: 60, padding: '4px 8px', borderRadius: 4, border: '1px solid #ccc' }}
          />
          <p style={{ minWidth: 70, textAlign: 'right', fontWeight: 600 }}>
            ${(item.price * item.quantity).toFixed(2)}
          </p>
          <button onClick={() => removeFromCart(item._id)} style={{ background: '#c62828', color: 'white', border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer' }}>
            Remove
          </button>
        </div>
      ))}

      <div style={{ textAlign: 'right', marginTop: 20 }}>
        <p style={{ fontSize: '1.3rem', fontWeight: 700 }}>Total: ${totalPrice.toFixed(2)}</p>
        <button onClick={() => navigate('/checkout')} style={{ ...btnStyle, marginTop: 12 }}>
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

const btnStyle = {
  background: '#2e7d32', color: 'white', border: 'none',
  padding: '10px 24px', borderRadius: 4, cursor: 'pointer', fontSize: '1rem',
};

export default CartPage;
