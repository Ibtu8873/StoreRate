import React, { useState, useEffect } from 'react';
import { X, Building2, AlertCircle, Loader2 } from 'lucide-react';
import { adminService } from '../services/adminService';

export default function AddStoreModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    owner_id: ''
  });

  const [owners, setOwners] = useState([]);
  const [loadingOwners, setLoadingOwners] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      loadOwners();
    }
  }, [isOpen]);

  const loadOwners = async () => {
    try {
      setLoadingOwners(true);
      const res = await adminService.getStoreOwners();
      if (res.success) {
        setOwners(res.owners || []);
        if (res.owners?.length > 0) {
          setFormData((prev) => ({ ...prev, owner_id: res.owners[0].id }));
        }
      }
    } catch (err) {
      console.error('Failed to load store owners:', err);
    } finally {
      setLoadingOwners(false);
    }
  };

  if (!isOpen) return null;

  // Validation
  const isNameValid = formData.name.trim().length >= 20 && formData.name.trim().length <= 60;
  const isAddressValid = formData.address.trim().length > 0 && formData.address.trim().length <= 400;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim());
  const isOwnerValid = !!formData.owner_id;

  const canSubmit = isNameValid && isAddressValid && isEmailValid && isOwnerValid;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) {
      setError('Please fill all required store fields meeting the validation rules.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const res = await adminService.createStore(formData);
      if (res.success) {
        onSuccess(res.message || 'Store created successfully!');
        handleClose();
      }
    } catch (err) {
      const data = err.response?.data;
      setError(data?.message || 'Failed to create store.');
      if (data?.errors) {
        setFieldErrors(data.errors);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      email: '',
      address: '',
      owner_id: ''
    });
    setError(null);
    setFieldErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="relative bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-store-modal-title"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 id="add-store-modal-title" className="text-base font-bold text-slate-900">
                Add New Store
              </h3>
              <p className="text-xs text-slate-500">Register a new retail store and assign a Store Owner</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Store Name */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Store Name *
              </label>
              <span className={`text-[11px] ${formData.name.trim().length >= 20 && formData.name.trim().length <= 60 ? 'text-emerald-600 font-medium' : 'text-slate-400'}`}>
                {formData.name.trim().length}/60 (min 20)
              </span>
            </div>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              maxLength={60}
              placeholder="e.g. Metro Supermarket Downtown Branch"
              className={`input-field ${formData.name && !isNameValid ? 'input-field-error' : ''}`}
            />
            {fieldErrors.name && (
              <p className="text-xs text-rose-600 mt-1">{fieldErrors.name}</p>
            )}
            {formData.name && !isNameValid && !fieldErrors.name && (
              <p className="text-xs text-amber-600 mt-1">Store name must be between 20 and 60 characters.</p>
            )}
          </div>

          {/* Store Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Store Contact Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="store@domain.com"
              className={`input-field ${formData.email && !isEmailValid ? 'input-field-error' : ''}`}
            />
            {fieldErrors.email && (
              <p className="text-xs text-rose-600 mt-1">{fieldErrors.email}</p>
            )}
          </div>

          {/* Address */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Store Address *
              </label>
              <span className={`text-[11px] ${formData.address.trim().length > 400 ? 'text-rose-600 font-bold' : 'text-slate-400'}`}>
                {formData.address.trim().length}/400 max
              </span>
            </div>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              rows={2}
              maxLength={400}
              placeholder="Store physical location, unit number, city, postal code"
              className={`input-field resize-none ${formData.address && !isAddressValid ? 'input-field-error' : ''}`}
            />
            {fieldErrors.address && (
              <p className="text-xs text-rose-600 mt-1">{fieldErrors.address}</p>
            )}
          </div>

          {/* Owner Assignment */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Assigned Store Owner *
            </label>
            {loadingOwners ? (
              <div className="flex items-center gap-2 py-2 text-xs text-slate-500">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Loading registered store owners...
              </div>
            ) : owners.length === 0 ? (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                No users with role "Store Owner" found. Please create a Store Owner user first in User Management.
              </div>
            ) : (
              <select
                name="owner_id"
                value={formData.owner_id}
                onChange={handleChange}
                required
                className="input-field"
              >
                <option value="">Select a Store Owner...</option>
                {owners.map((owner) => (
                  <option key={owner.id} value={owner.id}>
                    {owner.name} ({owner.email})
                  </option>
                ))}
              </select>
            )}
            {fieldErrors.owner_id && (
              <p className="text-xs text-rose-600 mt-1">{fieldErrors.owner_id}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleClose}
              className="btn-secondary"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={!canSubmit || submitting || owners.length === 0}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Creating Store...
                </>
              ) : (
                'Create Store'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
