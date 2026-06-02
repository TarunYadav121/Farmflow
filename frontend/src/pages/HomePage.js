import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/products/ProductCard';
import { fetchProducts } from '../api/productApi';

const HomePage = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProducts()
      .then((res) => setProducts(res.data.slice(0, 8))) // show 8 featured
      .catch(console.error);
  }, []);

  return (
    <div>
      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '48px 16px', background: '#e8f5e9', borderRadius: 8 }}>
        <h1 style={{ fontSize: '2.5rem', color: '#2e7d32' }}>Farm-fresh produce, delivered.</h1>
        <p style={{ marginTop: 12, color: '#555', fontSize: '1.1rem' }}>
          Shop directly from local farmers and food producers.
        </p>
        <Link
          to="/products"
          style={{
            display: 'inline-block',
            marginTop: 24,
            padding: '12px 32px',
            background: '#2e7d32',
            color: 'white',
            borderRadius: 6,
            fontWeight: 600,
          }}
        >
          Browse Products
        </Link>
      </section>

      {/* Featured products */}
      <section style={{ marginTop: 40 }}>
        <h2 style={{ marginBottom: 20 }}>Featured Products</h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 20,
          }}
        >
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
