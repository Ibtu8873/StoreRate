import React, { useState, useEffect } from 'react';
import { Store, Star, Users, MapPin, Mail, Calendar, BarChart3, AlertCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import StarRating from '../components/StarRating';
import Table from '../components/Table';
import NotificationToast from '../components/NotificationToast';
import { ownerService } from '../services/ownerService';
import { useAuth } from '../context/AuthContext';

export default function OwnerDashboard() {
  const { user } = useAuth();
  const [storeData, setStoreData] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: null, type: 'success' });

  useEffect(() => {
    loadStoreAnalytics(selectedStoreId);
  }, [selectedStoreId]);

  const loadStoreAnalytics = async (storeId) => {
    try {
      setLoading(true);
      const [avgRes, ratingsRes] = await Promise.all([
        ownerService.getStoreAverageRating(storeId),
        ownerService.getStoreRatings(storeId)
      ]);

      if (avgRes.success) {
        setStoreData(avgRes);
        if (!selectedStoreId && avgRes.store?.id) {
          setSelectedStoreId(avgRes.store.id);
        }
      }

      if (ratingsRes.success) {
        setRatings(ratingsRes.ratings || []);
      }
    } catch (err) {
      console.error('Failed to load owner store data:', err);
      setToast({ message: 'Failed to load store ratings and analytics.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Define table columns for reviewers
  const reviewerColumns = [
    {
      key: 'user_name',
      header: 'Customer Name',
      sortable: false,
      render: (r) => (
        <div>
          <span className="font-semibold text-slate-900 block">{r.user_name}</span>
          <span className="text-[11px] text-slate-400">User #{r.user_id}</span>
        </div>
      )
    },
    {
      key: 'user_email',
      header: 'Email',
      sortable: false,
      render: (r) => <span className="text-slate-600 text-xs font-mono">{r.user_email}</span>
    },
    {
      key: 'user_address',
      header: 'Customer Address',
      sortable: false,
      render: (r) => <span className="text-slate-600 text-xs line-clamp-1 max-w-xs">{r.user_address}</span>
    },
    {
      key: 'rating',
      header: 'Submitted Rating',
      sortable: false,
      render: (r) => (
        <div className="flex items-center gap-2">
          <StarRating rating={r.rating} size="sm" />
          <span className="font-bold text-xs text-slate-800">{r.rating}/5</span>
        </div>
      )
    },
    {
      key: 'updated_at',
      header: 'Rated On',
      sortable: false,
      render: (r) => (
        <span className="text-slate-500 text-xs">
          {new Date(r.updated_at || r.created_at).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </span>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar onPasswordSuccess={(msg) => setToast({ message: msg, type: 'success' })} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-blue-100 text-blue-700">
                <Store className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                Store Owner Portal
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Store Performance & Ratings
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Review customer feedback, overall store rating, and community sentiment
            </p>
          </div>

          {/* Store Switcher (if owner has multiple stores) */}
          {storeData?.allStores && storeData.allStores.length > 1 && (
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-600">Active Store:</label>
              <select
                value={selectedStoreId || ''}
                onChange={(e) => setSelectedStoreId(Number(e.target.value))}
                className="input-field py-1.5 text-xs max-w-xs"
              >
                {storeData.allStores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Store Profile Card */}
        {storeData?.store && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200 mb-2">
                  <Store className="w-3.5 h-3.5" />
                  Your Managed Store
                </div>
                <h2 className="text-xl font-bold text-slate-900">
                  {storeData.store.name}
                </h2>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{storeData.store.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{storeData.store.address}</span>
                  </div>
                </div>
              </div>

              {/* Quick Overall Rating Badge */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-4 shrink-0">
                <div className="text-center">
                  <div className="text-3xl font-black text-slate-900">
                    {storeData.averageRating ? storeData.averageRating.toFixed(1) : '0.0'}
                  </div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 mt-0.5">
                    Average Score
                  </div>
                </div>
                <div className="border-l border-slate-200 pl-4 space-y-1">
                  <StarRating rating={storeData.averageRating || 0} size="md" />
                  <div className="text-xs text-slate-500 font-medium">
                    Based on {storeData.totalRatings} {storeData.totalRatings === 1 ? 'rating' : 'ratings'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Breakdown Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Store Average Rating"
            value={storeData?.averageRating ? `${storeData.averageRating.toFixed(1)} / 5.0` : 'No ratings yet'}
            icon={Star}
            description="Overall calculated customer score"
            color="amber"
          />

          <StatCard
            title="Total Submitted Ratings"
            value={storeData?.totalRatings || 0}
            icon={Users}
            description="Customers who submitted a review"
            color="blue"
          />

          {/* Rating Distribution Breakdown */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-3">
              Rating Distribution
            </span>
            <div className="space-y-1.5 text-xs">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = storeData?.distribution?.[stars] || 0;
                const total = storeData?.totalRatings || 0;
                const pct = total > 0 ? (count / total) * 100 : 0;

                return (
                  <div key={stars} className="flex items-center gap-2">
                    <span className="w-12 font-medium text-slate-600 flex items-center gap-1">
                      {stars} <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    </span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-8 text-right font-mono text-slate-400 text-[11px]">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Users Who Submitted Ratings Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Customer Ratings History ({ratings.length})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Detailed list of all registered users who rated your store
              </p>
            </div>
          </div>

          <Table
            columns={reviewerColumns}
            data={ratings}
            loading={loading}
            emptyMessage="No customer ratings have been submitted for your store yet."
          />
        </div>
      </main>

      <NotificationToast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: null, type: 'success' })}
      />
    </div>
  );
}
