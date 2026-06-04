import { useState, useEffect } from 'react';
import apiFetch from '../utils/apiFetch';
import AddressForm from '../components/AddressForm';
import './AddressPage.css';

function AddressPage() {
  const [addresses, setAddresses]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [editTarget, setEditTarget] = useState(null); // null = add, object = edit
  const [busy, setBusy]             = useState({});   // { [id]: true } per-address ops

  async function loadAddresses() {
    try {
      const res  = await apiFetch('/api/addresses');
      const data = await res.json();
      setAddresses(Array.isArray(data) ? data : []);
    } catch {
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadAddresses(); }, []);

  // Called after form saves — update list and close form
  function handleSaved(savedAddress) {
    // Reload the full list so ordering (default first) is correct
    loadAddresses();
    setShowForm(false);
    setEditTarget(null);
  }

  function openAdd() {
    setEditTarget(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function openEdit(address) {
    setEditTarget(address);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function closeForm() {
    setShowForm(false);
    setEditTarget(null);
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this address?')) return;
    setBusy(prev => ({ ...prev, [id]: true }));
    try {
      const res  = await apiFetch(`/api/addresses/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) { alert(data.message || 'Delete failed'); return; }
      loadAddresses();
    } catch {
      alert('Could not delete. Try again.');
    } finally {
      setBusy(prev => ({ ...prev, [id]: false }));
    }
  }

  async function handleSetDefault(id) {
    setBusy(prev => ({ ...prev, [id]: true }));
    try {
      const res  = await apiFetch(`/api/addresses/${id}/default`, { method: 'PUT' });
      const data = await res.json();
      if (res.ok) setAddresses(Array.isArray(data) ? data : []);
      else alert(data.message || 'Could not set default');
    } catch {
      alert('Could not update. Try again.');
    } finally {
      setBusy(prev => ({ ...prev, [id]: false }));
    }
  }

  return (
    <div className="ap-page">
      <div className="ap-header">
        <h2 className="ap-title">My Addresses</h2>
        {!showForm && (
          <button className="ap-add-btn" onClick={openAdd}>
            + Add Address
          </button>
        )}
      </div>

      {/* Add / Edit form */}
      {showForm && (
        <div className="ap-form-card">
          <h3 className="ap-form-title">
            {editTarget ? 'Edit Address' : 'Add New Address'}
          </h3>
          <AddressForm
            initial={editTarget}
            onSave={handleSaved}
            onCancel={closeForm}
          />
        </div>
      )}

      {/* Address list */}
      {loading ? (
        <div className="loading-block"><span className="spinner" />Loading addresses…</div>
      ) : addresses.length === 0 && !showForm ? (
        <div className="ap-empty">
          <span>📍</span>
          <p>No saved addresses yet.</p>
          <button className="ap-add-btn" onClick={openAdd}>Add your first address</button>
        </div>
      ) : (
        <div className="ap-list">
          {addresses.map(addr => (
            <div
              className={`ap-card ${addr.isDefault ? 'ap-card--default' : ''}`}
              key={addr._id}
            >
              {addr.isDefault && (
                <span className="ap-default-badge">Default</span>
              )}

              <p className="ap-card__name">{addr.fullName}</p>
              <p className="ap-card__line">{addr.addressLine}</p>
              <p className="ap-card__line">
                {addr.city}, {addr.state} – {addr.pincode}
              </p>
              <p className="ap-card__phone">📞 {addr.phone}</p>

              <div className="ap-card__actions">
                {!addr.isDefault && (
                  <button
                    className="ap-action-btn ap-action-btn--default"
                    onClick={() => handleSetDefault(addr._id)}
                    disabled={busy[addr._id]}
                  >
                    Set Default
                  </button>
                )}
                <button
                  className="ap-action-btn ap-action-btn--edit"
                  onClick={() => openEdit(addr)}
                  disabled={busy[addr._id]}
                >
                  Edit
                </button>
                <button
                  className="ap-action-btn ap-action-btn--delete"
                  onClick={() => handleDelete(addr._id)}
                  disabled={busy[addr._id]}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AddressPage;
