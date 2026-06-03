import { useState, useEffect } from 'react';
import './SellerDashboard.css';
import apiFetch from '../utils/apiFetch';

const BLANK = {
  name: '', mrp: '', discount: '0',
  category: 'vegetables', stock: '', description: '',
};

const CATEGORIES = [
  'vegetables', 'fruits', 'grains', 'dairy',
  'herbs', 'electronics', 'clothing', 'mobile', 'accessories', 'other',
];

// Combined Add / Edit Form 

function ProductForm({ editProduct, onDone, onCancel }) {
  const isEdit = Boolean(editProduct);

  const [form, setForm]       = useState(BLANK);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg]         = useState(null);

  useEffect(() => {
    if (editProduct) {
      setForm({
        name:        editProduct.name        ?? '',
        mrp:         editProduct.mrp         ?? '',
        discount:    editProduct.discount    ?? '0',
        category:    editProduct.category    ?? 'vegetables',
        stock:       editProduct.stock       ?? '',
        description: editProduct.description ?? '',
      });
    } else {
      setForm(BLANK);
    }
    setMsg(null);
  }, [editProduct]);

  function change(field) {
    return e => setForm(prev => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);

    const body = {
      ...form,
      mrp:      Number(form.mrp)      ?? 0,
      discount: Number(form.discount) ?? 0,
      stock:    Number(form.stock)    ?? 0,
    };

    try {
      const url    = isEdit ? `/api/products/update/${editProduct._id}` : '/api/products/add';
      const method = isEdit ? 'PUT' : 'POST';

      const res  = await apiFetch(url, { method, body: JSON.stringify(body) });
      const data = await res.json();

      if (!res.ok) {
        setMsg({ text: data.error || data.message || 'Failed', type: 'error' });
        return;
      }

      alert(isEdit ? 'Product updated!' : 'Product added!');
      setForm(BLANK);
      onDone();
    } catch {
      setMsg({ text: 'Request failed', type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="sd-card">
      <div className="sd-form-header">
        <h3>{isEdit ? `Editing: ${editProduct.name}` : 'Add Product'}</h3>
        {isEdit && (
          <button className="sd-cancel" type="button" onClick={onCancel}>
            ✕ Cancel
          </button>
        )}
      </div>

      {msg && <div className={`sd-msg sd-msg--${msg.type}`}>{msg.text}</div>}

      <form onSubmit={handleSubmit}>
        <div className="sd-field-row">
          <div className="sd-field">
            <label>Name</label>
            <input value={form.name} onChange={change('name')} placeholder="e.g. Tomatoes" required />
          </div>
          <div className="sd-field">
            <label>Category</label>
            <select value={form.category} onChange={change('category')}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="sd-field-row">
          <div className="sd-field">
            <label>MRP (₹)</label>
            <input type="number" min="0" value={form.mrp} onChange={change('mrp')} placeholder="100" required />
          </div>
          <div className="sd-field">
            <label>Discount (%)</label>
            <input type="number" min="0" max="100" value={form.discount} onChange={change('discount')} />
          </div>
          <div className="sd-field">
            <label>Stock</label>
            <input type="number" min="0" value={form.stock} onChange={change('stock')} placeholder="50" required />
          </div>
        </div>

        <div className="sd-field">
          <label>Description (optional)</label>
          <textarea rows={2} value={form.description} onChange={change('description')} />
        </div>

        <button className="sd-btn" type="submit" disabled={loading}>
          {loading
            ? (isEdit ? 'Updating…' : 'Adding…')
            : (isEdit ? 'Update Product' : 'Add Product')}
        </button>
      </form>
    </div>
  );
}

//  My Products Table 

function MyProducts({ refreshKey, onEdit, onDeleted }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [deleting, setDeleting] = useState({}); // { [id]: true } while in-flight

  useEffect(() => {
    setLoading(true);
    apiFetch('/api/products/my-products')
      .then(r => r.json())
      .then(data => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  async function handleDelete(product) {
    if (!window.confirm(`Are you sure you want to delete "${product.name}"?`)) return;

    setDeleting(prev => ({ ...prev, [product._id]: true }));
    try {
      const res  = await apiFetch(`/api/products/delete/${product._id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.message || 'Delete failed');
        return;
      }

      alert('Product deleted');
      onDeleted(); // refresh list
    } catch {
      alert('Could not delete. Check your connection.');
    } finally {
      setDeleting(prev => ({ ...prev, [product._id]: false }));
    }
  }

  return (
    <div className="sd-card">
      <h3>My Products {!loading && `(${products.length})`}</h3>

      {loading ? (
        <p className="sd-state">Loading…</p>
      ) : products.length === 0 ? (
        <div className="sd-empty">
          <span>📦</span>
          <p>No products yet. Add your first product above.</p>
        </div>
      ) : (
        <div className="sd-table-wrap">
          <table className="sd-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>MRP</th>
                <th>Discount</th>
                <th>Final Price</th>
                <th>Stock</th>
                <th>Category</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p._id}>
                  <td className="sd-td-name">{p.name}</td>
                  <td>₹{p.mrp}</td>
                  <td>{p.discount}%</td>
                  <td className="sd-td-price">₹{p.finalPrice?.toFixed(2)}</td>
                  <td>
                    <span className={p.stock === 0 ? 'sd-oos' : 'sd-instock'}>
                      {p.stock === 0 ? 'Out' : p.stock}
                    </span>
                  </td>
                  <td className="sd-td-cat">{p.category}</td>
                  <td className="sd-td-actions">
                    <button className="sd-edit-btn" onClick={() => onEdit(p)}>
                      Edit
                    </button>
                    <button
                      className="sd-delete-btn"
                      onClick={() => handleDelete(p)}
                      disabled={deleting[p._id]}
                    >
                      {deleting[p._id] ? '…' : 'Delete'}
                    </button>
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

// Seller Dashboard 

function SellerDashboard() {
  const [refreshKey, setRefreshKey]   = useState(0);
  const [editProduct, setEditProduct] = useState(null);

  function refresh() {
    setEditProduct(null);
    setRefreshKey(k => k + 1);
  }

  return (
    <div className="sd-page">
      <h2 className="sd-title">Seller Dashboard</h2>

      <ProductForm
        editProduct={editProduct}
        onDone={refresh}
        onCancel={() => setEditProduct(null)}
      />

      <MyProducts
        refreshKey={refreshKey}
        onEdit={product => {
          setEditProduct(product);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onDeleted={refresh}
      />
    </div>
  );
}

export default SellerDashboard;
