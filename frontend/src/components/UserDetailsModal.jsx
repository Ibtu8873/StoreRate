import React, { useState, useEffect } from 'react';
import { X, User, Shield, Store, MapPin, Mail, Calendar, Star, Building2, Loader2 } from 'lucide-react';
import { adminService } from '../services/adminService';
import StarRating from './StarRating';

export default function UserDetailsModal({ userId, isOpen, onClose }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && userId) {
      loadUserDetails(userId);
    }
  }, [isOpen, userId]);

  const loadUserDetails = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.getUserDetails(id);
      if (res.success) {
        setUser(res.user);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load user details.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return { label: 'Administrator', icon: Shield, color: 'bg-purple-100 text-purple-700 border-purple-200' };
      case 'owner':
        return { label: 'Store Owner', icon: Store, color: 'bg-blue-100 text-blue-700 border-blue-200' };
      case 'user':
      default:
        return { label: 'Normal User', icon: User, color: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
    }
  };

  const badge = user ? getRoleBadge(user.role) : null;
  const BadgeIcon = badge?.icon;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="relative bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-details-modal-title"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-600">
              User Profile & Activity
            </span>
            <h3 id="user-details-modal-title" className="text-lg font-bold text-slate-900 mt-0.5">
              {loading ? 'Loading user...' : user?.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
            <span className="text-xs text-slate-500">Loading user records...</span>
          </div>
        ) : error ? (
          <div className="py-8 text-center text-sm text-rose-600">
            {error}
          </div>
        ) : user ? (
          <div className="mt-5 space-y-5 text-sm">
            {/* Meta Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-slate-600 break-all">{user.email}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badge.color}`}>
                  <BadgeIcon className="w-3.5 h-3.5" />
                  {badge.label}
                </span>
              </div>

              <div className="flex items-start gap-2 sm:col-span-2">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span className="text-slate-600">{user.address}</span>
              </div>

              <div className="flex items-center gap-2 text-slate-400 text-[11px] sm:col-span-2 pt-2 border-t border-slate-200/60">
                <Calendar className="w-3.5 h-3.5" />
                <span>Joined on {new Date(user.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
              </div>
            </div>

            {/* If Store Owner: Show Owned Stores and Rating */}
            {user.role === 'owner' && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-brand-600" />
                  Registered Stores & Overall Ratings
                </h4>
                {user.stores && user.stores.length > 0 ? (
                  <div className="space-y-2">
                    {user.stores.map((store) => (
                      <div key={store.id} className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-slate-900 text-sm">{store.name}</div>
                          <div className="text-xs text-slate-500 line-clamp-1">{store.address}</div>
                        </div>
                        <div className="text-right">
                          <StarRating rating={store.average_rating || 0} size="sm" showValue={true} />
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {store.total_ratings} {store.total_ratings === 1 ? 'rating' : 'ratings'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No stores currently registered for this owner.</p>
                )}
              </div>
            )}

            {/* If Normal User: Show ratings they submitted */}
            {user.role === 'user' && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-500" />
                  Submitted Ratings History
                </h4>
                {user.submittedRatings && user.submittedRatings.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {user.submittedRatings.map((rate) => (
                      <div key={rate.id} className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-slate-900 text-xs">{rate.store_name}</div>
                          <div className="text-[11px] text-slate-400 line-clamp-1">{rate.store_address}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <StarRating rating={rate.rating} size="sm" />
                          <span className="font-bold text-xs text-slate-800">{rate.rating}/5</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">This user has not submitted any store ratings yet.</p>
                )}
              </div>
            )}
          </div>
        ) : null}

        <div className="mt-6 pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
