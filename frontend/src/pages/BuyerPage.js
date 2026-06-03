import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './BuyerPage.css';

const CATEGORIES = ['all', 'vegetables', 'fruits', 'grains', 'dairy',
                    'herbs', 'electronics', 'clothing', 'mobile', 'accessories', 'other'];

function BuyerPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [category, setCategory] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(data => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  // Combine search + category filter — recalculates only when deps change
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter(p => {
      const matchName     = !q || p.name.toLowerCase().includes(q);
      const matchCategory = category === 'all' || p.category === category;
      return matchName && matchCategory;
    });
  }, [products, search, category]);

  function handleBuy(product) {
    navigate('/payment', {
      state: {
        productId: product._id,
        name:      product.name,
        price:     product.finalPrice,
        mrp:       product.mrp,
        discount:  product.discount,
        image:     product.image,
      },
    });
  }

  if (loading) {
    return (
      <div className="bp-page">
        <div className="bp-loading">Loading products…</div>
      </div>
    );
  }

  return (
    <div className="bp-page">
      <h2 className="bp-title">All Products</h2>

      {/*Filters */}
      <div className="bp-filters">
        <input
          className="bp-search"
          type="text"
          placeholder="Search by name…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="bp-category"
          value={category}
          onChange={e => setCategory(e.target.value)}
        >
          {CATEGORIES.map(c => (
            <option key={c} value={c}>
              {c === 'all' ? 'All Categories' : c.charAt(0).toUpperCase() + c.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* ── Result count ────────────────────────────────────────────────── */}
      {!loading && (
        <p className="bp-count">
          {filtered.length === 0
            ? 'No products match your filters.'
            : `Showing ${filtered.length} product${filtered.length !== 1 ? 's' : ''}`}
        </p>
      )}

      {/* ── Grid ────────────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="bp-empty-state">
          <span>🔍</span>
          <p>No products found. Try a different search or category.</p>
        </div>
      ) : (
        <div className="bp-grid">
          {filtered.map(p => {
            const outOfStock  = p.stock <= 0;
            const hasDiscount = p.discount > 0;

            return (
              <div className={`bp-card ${outOfStock ? 'bp-card--oos' : ''}`} key={p._id}>

                {/* Image */}
                <div className="bp-card__img-wrap">
                  {p.image
                    ? <img src={p.image} alt={p.name} className="bp-card__img" />
                    : <div className="bp-card__img-placeholder">🌿</div>
                  }
                  {hasDiscount && (
                    <span className="bp-card__badge">{p.discount}% OFF</span>
                  )}
                  {outOfStock && (
                    <div className="bp-card__oos-overlay">Out of Stock</div>
                  )}
                </div>

                {/* Body */}
                <div className="bp-card__body">
                  <h3 className="bp-card__name">{p.name}</h3>
                  <p className="bp-card__meta">
                    {p.category} · {p.seller?.name || '—'}
                  </p>

                  <div className="bp-card__pricing">
                    {hasDiscount && (
                      <span className="bp-card__mrp">₹{p.mrp}</span>
                    )}
                    <span className="bp-card__price">₹{p.finalPrice?.toFixed(2)}</span>
                  </div>

                  <p className={`bp-card__stock ${outOfStock ? 'bp-card__stock--oos' : ''}`}>
                    {outOfStock ? 'Out of Stock' : `In Stock: ${p.stock}`}
                  </p>

                  <button
                    className="bp-card__btn"
                    onClick={() => handleBuy(p)}
                    disabled={outOfStock}
                  >
                    {outOfStock ? 'Out of Stock' : 'Buy Now'}
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default BuyerPage;
