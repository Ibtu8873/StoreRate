import React, { useState } from 'react';
import { X, UserPlus, AlertCircle, Loader2, Check } from 'lucide-react';
import { adminService } from '../services/adminService';

export default function AddUserModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    role: 'user'
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  if (!isOpen) return null;

  // Real-time validations
  const isNameValid = formData.name.trim().length >= 20 && formData.name.trim().length <= 60;
  const isAddressValid = formData.address.trim().length > 0 && formData.address.trim().length <= 400;
  const isPasswordLen = formData.password.length >= 8 && formData.password.length <= 16;
  const isPasswordUpper = /[A-Z]/.test(formData.password);
  const isPasswordSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password);
  const isPasswordValid = isPasswordLen && isPasswordUpper && isPasswordSpecial;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim());

  const canSubmit = isNameValid && isAddressValid && isPasswordValid && isEmailValid;

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
      setError('Please resolve all validation errors before submitting.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const res = await adminService.createUser(formData);
      if (res.success) {
        onSuccess(res.message || 'User created successfully!');
        handleClose();
      }
    } catch (err) {
      const data = err.response?.data;
      setError(data?.message || 'Failed to create user.');
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
      password: '',
      address: '',
      role: 'user'
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
        aria-labelledby="add-user-modal-title"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 id="add-user-modal-title" className="text-base font-bold text-slate-900">
                Add New User
              </h3>
              <p className="text-xs text-slate-500">Create an Administrator, Normal User, or Store Owner</p>
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

          {/* Role Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              User Role *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'user', label: 'Normal User' },
                { id: 'owner', label: 'Store Owner' },
                { id: 'admin', label: 'Admin' }
              ].map((r) => (
                <button
                  type="button"
                  key={r.id}
                  onClick={() => setFormData(prev => ({ ...prev, role: r.id }))}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all text-center ${
                    formData.role === r.id
                      ? 'bg-brand-50 border-brand-500 text-brand-700 ring-2 ring-brand-500/20'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Full Name *
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
              placeholder="e.g. Jonathan Alexander Sterling"
              className={`input-field ${formData.name && !isNameValid ? 'input-field-error' : ''}`}
            />
            {fieldErrors.name && (
              <p className="text-xs text-rose-600 mt-1">{fieldErrors.name}</p>
            )}
            {formData.name && !isNameValid && !fieldErrors.name && (
              <p className="text-xs text-amber-600 mt-1">Name must be between 20 and 60 characters.</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="user@example.com"
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
                Address *
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
              placeholder="Street address, City, State/Province, Postal Code"
              className={`input-field resize-none ${formData.address && !isAddressValid ? 'input-field-error' : ''}`}
            />
            {fieldErrors.address && (
              <p className="text-xs text-rose-600 mt-1">{fieldErrors.address}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Initial Password *
            </label>
            <input
              type="text"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              maxLength={16}
              placeholder="8-16 chars, 1 uppercase, 1 special symbol"
              className={`input-field font-mono ${formData.password && !isPasswordValid ? 'input-field-error' : ''}`}
            />
            {/* Live requirements checklist */}
            <div className="mt-2 p-2.5 bg-slate-50 rounded-lg border border-slate-200/80 space-y-1 text-[11px]">
              <div className={`flex items-center gap-1.5 ${isPasswordLen ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
                <Check className={`w-3 h-3 ${isPasswordLen ? 'text-emerald-600' : 'text-slate-300'}`} />
                <span>8 to 16 characters ({formData.password.length})</span>
              </div>
              <div className={`flex items-center gap-1.5 ${isPasswordUpper ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
                <Check className={`w-3 h-3 ${isPasswordUpper ? 'text-emerald-600' : 'text-slate-300'}`} />
                <span>At least 1 uppercase letter (A-Z)</span>
              </div>
              <div className={`flex items-center gap-1.5 ${isPasswordSpecial ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
                <Check className={`w-3 h-3 ${isPasswordSpecial ? 'text-emerald-600' : 'text-slate-300'}`} />
                <span>At least 1 special character (!@#$%^&*...)</span>
              </div>
            </div>
            {fieldErrors.password && (
              <p className="text-xs text-rose-600 mt-1">{fieldErrors.password}</p>
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
              disabled={!canSubmit || submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Creating User...
                </>
              ) : (
                'Create User'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
