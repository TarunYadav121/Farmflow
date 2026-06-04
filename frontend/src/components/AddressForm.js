import { useState, useEffect } from 'react';
import './AddressForm.css';

const BLANK = {
  fullName: '', phone: '', addressLine: '',
  city: '', state: '', pincode: '', isDefault: false,
};

/**
 * AddressForm — used both by AddressPage (standalone) and PaymentPage (inline).
 *
 * Props:
 *   initial   — pre-fill values for edit mode (optional)
 *   onSave(address) — called with the saved address on success
 *   onCancel  — called when user clicks Cancel
 *   submitLabel — button label override (default: "Save Address")
 */
function AddressForm({ initial, onSave, onCancel, submitLabel = 'Save Address' }) {
  const [form, setForm]     = useState(BLANK);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  useEffect(() => {
    if (initial) {
      setForm({
        fullName:    initial.fullName    ?? '',
        phone:       initial.phone       ?? '',
        addressLine: initial.addressLine ?? '',
        city:        initial.city        ?? '',
        state:       initial.state       ?? '',
        pincode:     initial.pincode     ?? '',
        isDefault:   initial.isDefault   ?? false,
      });
    } else {
      setForm(BLANK);
    }
    setError('');
  }, [initial]);

  function change(field) {
    return e => setForm(prev => ({
      ...prev,
      [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const isEdit = Boolean(initial?._id);
      const url    = isEdit ? `/api/addresses/${initial._id}` : '/api/addresses';
      const method = isEdit ? 'PUT' : 'POST';

      // apiFetch is not imported here — use raw fetch with auth header
      // (keeps this component dependency-free from the app's auth util)
      const res  = await fetch(url, {
        method,
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Failed to save address');
        return;
      }

      onSave(data);
    } catch {
      setError('Could not reach server.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="af-form" onSubmit={handleSubmit}>
      {error && <p className="af-error">{error}</p>}

      <div className="af-row">
        <div className="af-field">
          <label>Full Name</label>
          <input
            value={form.fullName}
            onChange={change('fullName')}
            placeholder="e.g. Ravi Kumar"
            required
          />
        </div>
        <div className="af-field">
          <label>Phone</label>
          <input
            value={form.phone}
            onChange={change('phone')}
            placeholder="10-digit mobile number"
            required
          />
        </div>
      </div>

      <div className="af-field af-field--full">
        <label>Address Line</label>
        <input
          value={form.addressLine}
          onChange={change('addressLine')}
          placeholder="House no., street, area"
          required
        />
      </div>

      <div className="af-row">
        <div className="af-field">
          <label>City</label>
          <input
            value={form.city}
            onChange={change('city')}
            placeholder="City"
            required
          />
        </div>
        <div className="af-field">
          <label>State</label>
          <input
            value={form.state}
            onChange={change('state')}
            placeholder="State"
            required
          />
        </div>
        <div className="af-field">
          <label>Pincode</label>
          <input
            value={form.pincode}
            onChange={change('pincode')}
            placeholder="6-digit pincode"
            maxLength={6}
            required
          />
        </div>
      </div>

      <label className="af-checkbox">
        <input
          type="checkbox"
          checked={form.isDefault}
          onChange={change('isDefault')}
        />
        Set as default address
      </label>

      <div className="af-actions">
        <button type="submit" className="af-btn af-btn--save" disabled={loading}>
          {loading ? 'Saving…' : submitLabel}
        </button>
        {onCancel && (
          <button type="button" className="af-btn af-btn--cancel" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default AddressForm;
