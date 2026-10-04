import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, Mail, Lock, User, MapPin, AlertCircle, Loader2, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const { signup, isAuthenticated, role, getRoleDashboard } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    password: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  React.useEffect(() => {
    if (isAuthenticated && role) {
      navigate(getRoleDashboard(role), { replace: true });
    }
  }, [isAuthenticated, role, navigate, getRoleDashboard]);

  // Validation states
  const isNameValid = formData.name.trim().length >= 20 && formData.name.trim().length <= 60;
  const isAddressValid = formData.address.trim().length > 0 && formData.address.trim().length <= 400;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim());
  const isPasswordLen = formData.password.length >= 8 && formData.password.length <= 16;
  const isPasswordUpper = /[A-Z]/.test(formData.password);
  const isPasswordSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password);
  const isPasswordValid = isPasswordLen && isPasswordUpper && isPasswordSpecial;
  const isPasswordMatch = formData.password.length > 0 && formData.password === formData.confirmPassword;

  const canSubmit = isNameValid && isAddressValid && isEmailValid && isPasswordValid && isPasswordMatch;

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
      setError('Please resolve all validation requirements before continuing.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await signup({
        name: formData.name,
        email: formData.email,
        address: formData.address,
        password: formData.password
      });
    } catch (err) {
      const data = err.response?.data;
      setError(data?.message || err.message || 'Signup failed.');
      if (data?.errors) {
        setFieldErrors(data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-brand-50/40 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/25 group-hover:scale-105 transition-transform">
            <Star className="w-6 h-6 fill-white" />
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-900">
            Rate<span className="text-brand-600">Hub</span>
          </span>
        </Link>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
          Create your account
        </h2>
        <p className="mt-1.5 text-xs text-slate-500">
          Join RateHub as a Normal User to discover and rate local stores
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/80">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-slate-700" htmlFor="signup-name">
                  Full Name *
                </label>
                <span className={`text-[11px] ${isNameValid ? 'text-emerald-600 font-medium' : 'text-slate-400'}`}>
                  {formData.name.trim().length}/60 (min 20)
                </span>
              </div>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="signup-name"
                  type="text"
                  name="name"
                  required
                  maxLength={60}
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Jonathan Alexander Sterling"
                  className={`input-field pl-9 ${formData.name && !isNameValid ? 'input-field-error' : ''}`}
                />
              </div>
              {fieldErrors.name && <p className="text-xs text-rose-600 mt-1">{fieldErrors.name}</p>}
              {formData.name && !isNameValid && !fieldErrors.name && (
                <p className="text-xs text-amber-600 mt-1">Name must be between 20 and 60 characters.</p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="signup-email">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="signup-email"
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className={`input-field pl-9 ${formData.email && !isEmailValid ? 'input-field-error' : ''}`}
                />
              </div>
              {fieldErrors.email && <p className="text-xs text-rose-600 mt-1">{fieldErrors.email}</p>}
            </div>

            {/* Address */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-slate-700" htmlFor="signup-address">
                  Physical Address *
                </label>
                <span className={`text-[11px] ${formData.address.trim().length > 400 ? 'text-rose-600 font-bold' : 'text-slate-400'}`}>
                  {formData.address.trim().length}/400 max
                </span>
              </div>
              <div className="relative">
                <textarea
                  id="signup-address"
                  name="address"
                  required
                  rows={2}
                  maxLength={400}
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Street address, City, State/Province, Country"
                  className={`input-field resize-none ${formData.address && !isAddressValid ? 'input-field-error' : ''}`}
                />
              </div>
              {fieldErrors.address && <p className="text-xs text-rose-600 mt-1">{fieldErrors.address}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="signup-password">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="signup-password"
                  type="password"
                  name="password"
                  required
                  maxLength={16}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="8 to 16 characters"
                  className={`input-field pl-9 ${formData.password && !isPasswordValid ? 'input-field-error' : ''}`}
                />
              </div>
              {/* Password Requirements Checklist */}
              <div className="mt-2 p-2.5 bg-slate-50 rounded-lg border border-slate-200/80 space-y-1 text-[11px]">
                <div className={`flex items-center gap-1.5 ${isPasswordLen ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
                  <Check className={`w-3 h-3 ${isPasswordLen ? 'text-emerald-600' : 'text-slate-300'}`} />
                  <span>8 to 16 characters</span>
                </div>
                <div className={`flex items-center gap-1.5 ${isPasswordUpper ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
                  <Check className={`w-3 h-3 ${isPasswordUpper ? 'text-emerald-600' : 'text-slate-300'}`} />
                  <span>At least one uppercase letter (A-Z)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${isPasswordSpecial ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
                  <Check className={`w-3 h-3 ${isPasswordSpecial ? 'text-emerald-600' : 'text-slate-300'}`} />
                  <span>At least one special character (!@#$%^&*...)</span>
                </div>
              </div>
              {fieldErrors.password && <p className="text-xs text-rose-600 mt-1">{fieldErrors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="signup-confirm">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="signup-confirm"
                  type="password"
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  className={`input-field pl-9 ${formData.confirmPassword && !isPasswordMatch ? 'input-field-error' : ''}`}
                />
              </div>
              {formData.confirmPassword && !isPasswordMatch && (
                <p className="text-xs text-rose-600 mt-1">Passwords do not match.</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !canSubmit}
              className="w-full btn-primary py-3 text-sm font-semibold mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Creating Account...
                </>
              ) : (
                <>
                  Register as Normal User
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-slate-600">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700 underline underline-offset-2">
            Sign In here
          </Link>
        </p>
      </div>
    </div>
  );
}
