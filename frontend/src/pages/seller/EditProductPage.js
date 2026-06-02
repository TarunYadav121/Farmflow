import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchProductById, updateProduct } from '../../api/productApi';
import { toast } from 'react-toastify';

const CATEGORIES = ['vegetables', 'fruits', 'grains', 'dairy', 'herbs', 'other'];

const EditProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProductById(id).then((res) => {
      const { name, description, price, category, stock, unit } = res.data;
      setForm({ name, description, price, category, stock, unit });
    });
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProduct(id, form);
      toast.success('Product updated');
      navigate('/seller/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  if (!form) return <p>Loading...</p>;

  return (
    <div style={{ maxWidth: 500, margin: '0 auto' }}>
      <h2 style={{ marginBottom: 24 }}>Edit Product</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <input name="name" value={form.name} onChange={handleChange} required style={inputStyle} />
        <textarea name="description" value={form.description} onChange={handleChange} required rows={3} style={inputStyle} />
        <input name="price" type="number" value={form.price} onChange={handleChange} required min="0" style={inputStyle} />
        <select name="category" value={form.category} onChange={handleChange} style={inputStyle}>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <input name="stock" type="number" value={form.stock} onChange={handleChange} required min="0" style={inputStyle} />
        <input name="unit" value={form.unit} onChange={handleChange} style={inputStyle} />
        <button type="submit" disabled={loading} style={btnStyle}>
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

const inputStyle = {
  padding: '10px 14px', borderRadius: 4, border: '1px solid #ccc', fontSize: '1rem', width: '100%',
};
const btnStyle = {
  background: '#2e7d32', color: 'white', border: 'none',
  padding: '12px', borderRadius: 4, cursor: 'pointer', fontSize: '1rem',
};

export default EditProductPage;
