import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchProductById } from '../api/productApi';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';

const ProductDetailPage = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProductById(id)
      .then((res) => setProduct(res.data))
      .catch(console.error);
  }, [id]);

  if (!product) return <p>Loading...</p>;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
        <img
          src={product.images?.[0] || '/placeholder.png'}
          alt={product.name}
          style={{ width: 340, height: 300, objectFit: 'cover', borderRadius: 8 }}
        />
        <div style={{ flex: 1 }}>
          <h2>{product.name}</h2>
          <p style={{ color: '#888', margin: '8px 0' }}>Sold by {product.seller?.name}</p>
          <p style={{ fontSize: '1.6rem', color: '#2e7d32', fontWeight: 'bold' }}>
            ${product.price} / {product.unit}
          </p>
          <p style={{ marginTop: 12 }}>{product.description}</p>
          <p style={{ marginTop: 8, color: product.stock > 0 ? '#2e7d32' : 'red' }}>
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 20, alignItems: 'center' }}>
            <input
              type="number"
              value={quantity}
              min={1}
              max={product.stock}
              onChange={(e) => setQuantity(Number(e.target.value))}
              style={{ width: 64, padding: '6px 10px', borderRadius: 4, border: '1px solid #ccc' }}
            />
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              style={{
                background: '#2e7d32', color: 'white', border: 'none',
                padding: '10px 24px', borderRadius: 4, cursor: 'pointer', fontSize: '1rem',
              }}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
