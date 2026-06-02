import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchSellerProducts } from '../../api/sellerApi';
import { deleteProduct } from '../../api/productApi';
import { toast } from 'react-toastify';

const ManageProducts = () => {
  const [products, setProducts] = useState([]);

  const load = () => {
    fetchSellerProducts().then((res) => setProducts(res.data)).catch(console.error);
  };

  useEffect(load, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await deleteProduct(id);
      toast.success('Product deleted');
      load();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2>My Products</h2>
        <Link to="/seller/products/add" style={{ background: '#2e7d32', color: 'white', padding: '8px 18px', borderRadius: 4 }}>
          + Add Product
        </Link>
      </div>
      {products.length === 0 ? (
        <p>No products yet.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
          <thead>
            <tr style={{ background: '#e8f5e9' }}>
              {['Name', 'Price', 'Stock', 'Category', 'Actions'].map((h) => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px 14px' }}>{p.name}</td>
                <td style={{ padding: '10px 14px' }}>${p.price}</td>
                <td style={{ padding: '10px 14px' }}>{p.stock}</td>
                <td style={{ padding: '10px 14px' }}>{p.category}</td>
                <td style={{ padding: '10px 14px', display: 'flex', gap: 8 }}>
                  <Link to={`/seller/products/edit/${p._id}`} style={{ color: '#1976d2' }}>Edit</Link>
                  <button onClick={() => handleDelete(p._id)} style={{ color: '#c62828', background: 'none', border: 'none', cursor: 'pointer' }}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ManageProducts;
