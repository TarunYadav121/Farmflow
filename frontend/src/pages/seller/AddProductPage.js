import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProduct } from '../../api/productApi';
import { toast } from 'react-toastify';

const CATEGORIES = ['vegetables', 'fruits', 'grains', 'dairy', 'herbs', 'other'];

const AddProductPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', description: '', price: '', category: 'vegetables', stock: '', unit: 'kg',
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      images.forEach((img) => formData.append('images', img));

      await createProduct(formData);
      toast.success('Product added');
      navigate('/seller/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: '0 auto' }}>
      <h2 style={{ marginBottom: 24 }}>Add New Product</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <input name="name" placeholder="Product name" value={form.name} onChange={handleChange} required style={inputStyle} />
        <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} required rows={3} style={inputStyle} />
        <input name="price" type="number" placeholder="Price" value={form.price} onChange={handleChange} required min="0" style={inputStyle} />
        <select name="category" value={form.category} onChange={handleChange} style={inputStyle}>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <input name="stock" type="number" placeholder="Stock quantity" value={form.stock} onChange={handleChange} required min="0" style={inputStyle} />
        <input name="unit" placeholder="Unit (kg, piece, etc.)" value={form.unit} onChange={handleChange} style={inputStyle} />
        <div>
          <label style={{ display: 'block', marginBottom: 6 }}>Product Images</label>
          <input type="file" multiple accept="image/*" onChange={(e) => setImages(Array.from(e.target.files))} />
        </div>
        <button type="submit" disabled={loading} style={btnStyle}>
          {loading ? 'Adding...' : 'Add Product'}
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

export default AddProductPage;
