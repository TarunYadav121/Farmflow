import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { createOrder } from '../../api/orderApi';
import { toast } from 'react-toastify';

const CheckoutPage = () => {
  const { cartItems, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [address, setAddress] = useState({
    street: '', city: '', state: '', zipCode: '', country: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const items = cartItems.map((item) => ({
        product: item._id,
        quantity: item.quantity,
      }));
      await createOrder({ items, shippingAddress: address });
      clearCart();
      toast.success('Order placed successfully');
      navigate('/my-orders');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Order failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: '0 auto' }}>
      <h2 style={{ marginBottom: 24 }}>Checkout</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {['street', 'city', 'state', 'zipCode', 'country'].map((field) => (
          <input
            key={field}
            name={field}
            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
            value={address[field]}
            onChange={handleChange}
            required
            style={inputStyle}
          />
        ))}
        <div style={{ borderTop: '1px solid #eee', paddingTop: 12, fontSize: '1.1rem', fontWeight: 600 }}>
          Order Total: ${totalPrice.toFixed(2)}
        </div>
        <button type="submit" disabled={loading} style={btnStyle}>
          {loading ? 'Placing order...' : 'Place Order'}
        </button>
      </form>
    </div>
  );
};

const inputStyle = {
  padding: '10px 14px', borderRadius: 4, border: '1px solid #ccc', fontSize: '1rem',
};
const btnStyle = {
  background: '#2e7d32', color: 'white', border: 'none',
  padding: '12px', borderRadius: 4, cursor: 'pointer', fontSize: '1rem',
};

export default CheckoutPage;
