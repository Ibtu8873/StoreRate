import React, { useState, useEffect } from 'react';
import { X, Star, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import StarRating from './StarRating';
import { storeService } from '../services/storeService';

export default function RatingModal({ store, isOpen, onClose, onSuccess }) {
  const [selectedRating, setSelectedRating] = useState(store?.user_submitted_rating || 0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (store) {
      setSelectedRating(store.user_submitted_rating || 0);
      setError(null);
    }
  }, [store]);

  if (!isOpen || !store) return null;

  const isModifying = !!store.user_submitted_rating;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRating || selectedRating < 1 || selectedRating > 5) {
      setError('Please select a rating from 1 to 5 stars.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      let response;
      if (isModifying) {
        response = await storeService.modifyRating(store.id, selectedRating);
      } else {
        response = await storeService.submitRating(store.id, selectedRating);
      }

      if (response.success) {
        onSuccess(response.message || 'Rating saved successfully!');
        onClose();
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to submit rating.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rating-modal-title"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-600">
              {isModifying ? 'Modify Submitted Rating' : 'Submit Store Rating'}
            </span>
            <h3 id="rating-modal-title" className="text-lg font-bold text-slate-900 mt-1">
              {store.name}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{store.address}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-xs font-medium text-slate-500 mb-2">Tap a star to rate (1 to 5)</span>
            <StarRating
              rating={selectedRating}
              interactive={true}
              onRate={(r) => setSelectedRating(r)}
              size="lg"
              showLabel={true}
            />

            {store.user_submitted_rating && (
              <p className="text-xs text-slate-500 mt-3">
                Your previous rating was: <span className="font-semibold text-slate-700">{store.user_submitted_rating} / 5</span>
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting || selectedRating === 0}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : isModifying ? (
                'Update Rating'
              ) : (
                'Submit Rating'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
