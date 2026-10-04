import React, { useState, useEffect } from 'react';
import { Search, Star, MapPin, Mail, ArrowUpDown, Filter, RotateCcw, Building2, CheckCircle2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import StarRating from '../components/StarRating';
import RatingModal from '../components/RatingModal';
import NotificationToast from '../components/NotificationToast';
import { storeService } from '../services/storeService';
import { useAuth } from '../context/AuthContext';

export default function UserDashboard() {
  const { user } = useAuth();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [addressFilter, setAddressFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('ASC');
  
  // Rating Modal
  const [selectedStore, setSelectedStore] = useState(null);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);

  // Notification Toast
  const [toast, setToast] = useState({ message: null, type: 'success' });

  useEffect(() => {
    loadStores();
  }, [search, nameFilter, addressFilter, sortBy, sortOrder]);

  const loadStores = async () => {
    try {
      setLoading(true);
      const res = await storeService.getStores({
        search,
        name: nameFilter,
        address: addressFilter,
        sortBy,
        sortOrder
      });
      if (res.success) {
        setStores(res.stores || []);
      }
    } catch (err) {
      console.error('Failed to load stores:', err);
      setToast({ message: 'Failed to load store directory.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRating = (store) => {
    setSelectedStore(store);
    setIsRatingModalOpen(true);
  };

  const handleRatingSuccess = (msg) => {
    setToast({ message: msg, type: 'success' });
    loadStores();
  };

  const handlePasswordSuccess = (msg) => {
    setToast({ message: msg, type: 'success' });
  };

  const handleSortChange = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(newSortBy);
      setSortOrder('ASC');
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setNameFilter('');
    setAddressFilter('');
    setSortBy('name');
    setSortOrder('ASC');
  };

  const hasActiveFilters = search || nameFilter || addressFilter;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar onPasswordSuccess={handlePasswordSuccess} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Hero Banner */}
        <div className="bg-gradient-to-r from-brand-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-brand-950/10 mb-8 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-md text-brand-200 border border-white/10 mb-3">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              Store Rating & Discovery
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name?.split(' ')[0] || 'User'}!
            </h1>
            <p className="mt-2 text-sm text-slate-300">
              Browse registered stores, search by name or location, and share your personal experience by submitting or updating your rating (1 to 5 stars).
            </p>
          </div>
          {/* Subtle background glow */}
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-brand-500/20 to-transparent pointer-events-none" />
        </div>

        {/* Search, Filter & Sort Controls */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Search by Name */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
                placeholder="Search by Store Name..."
                className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
              />
            </div>

            {/* Search by Address */}
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={addressFilter}
                onChange={(e) => setAddressFilter(e.target.value)}
                placeholder="Search by Store Address..."
                className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
              />
            </div>

            {/* Sort & Reset Actions */}
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1 text-xs">
                <span className="text-slate-400 px-2 font-medium">Sort:</span>
                <button
                  type="button"
                  onClick={() => handleSortChange('name')}
                  className={`flex-1 py-1.5 px-2 rounded-lg font-semibold transition-all ${
                    sortBy === 'name' ? 'bg-white text-brand-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Name {sortBy === 'name' && (sortOrder === 'ASC' ? '↑' : '↓')}
                </button>
                <button
                  type="button"
                  onClick={() => handleSortChange('rating')}
                  className={`flex-1 py-1.5 px-2 rounded-lg font-semibold transition-all ${
                    sortBy === 'rating' ? 'bg-white text-brand-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Rating {sortBy === 'rating' && (sortOrder === 'ASC' ? '↑' : '↓')}
                </button>
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="p-2.5 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                  title="Reset Filters"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stores Grid / Listing */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              Registered Stores ({stores.length})
            </h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 animate-pulse space-y-4">
                  <div className="h-5 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-100 rounded w-full"></div>
                  <div className="h-10 bg-slate-100 rounded"></div>
                </div>
              ))}
            </div>
          ) : stores.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No stores match your search</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Try clearing your search terms or adjusting the filters to see all available stores.
              </p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="btn-secondary mt-4 text-xs"
                >
                  Reset All Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stores.map((store) => {
                const hasRated = !!store.user_submitted_rating;

                return (
                  <div
                    key={store.id}
                    className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Store Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-1">
                            {store.name}
                          </h3>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{store.email}</span>
                          </div>
                        </div>
                        <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                          <Building2 className="w-5 h-5" />
                        </div>
                      </div>

                      {/* Store Address */}
                      <div className="flex items-start gap-2 text-xs text-slate-600 mt-3 pt-3 border-t border-slate-100">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{store.address}</span>
                      </div>

                      {/* Overall Rating Section */}
                      <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100/80">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            Overall Rating
                          </span>
                          <span className="text-xs text-slate-500">
                            {store.total_ratings} {store.total_ratings === 1 ? 'rating' : 'ratings'}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <StarRating rating={store.overall_rating || 0} size="sm" />
                          <span className="font-extrabold text-sm text-slate-900">
                            {store.overall_rating ? Number(store.overall_rating).toFixed(1) : 'No ratings yet'}
                          </span>
                        </div>
                      </div>

                      {/* User's Submitted Rating Badge */}
                      <div className="mt-3">
                        {hasRated ? (
                          <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200/80 rounded-xl text-xs text-emerald-800">
                            <div className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span className="font-medium">Your Submitted Rating:</span>
                            </div>
                            <div className="flex items-center gap-1 font-bold">
                              <Star className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
                              <span>{store.user_submitted_rating}/5</span>
                            </div>
                          </div>
                        ) : (
                          <div className="p-2.5 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-xs text-slate-400 text-center">
                            You have not rated this store yet
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="mt-5 pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => handleOpenRating(store)}
                        className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                          hasRated
                            ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-brand-600 hover:bg-brand-700 text-white shadow-xs hover:shadow'
                        }`}
                      >
                        <Star className={`w-4 h-4 ${hasRated ? 'fill-amber-600 text-amber-600' : 'fill-white text-white'}`} />
                        {hasRated ? 'Modify Your Rating' : 'Submit a Rating'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Rating Modal */}
      <RatingModal
        store={selectedStore}
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        onSuccess={handleRatingSuccess}
      />

      {/* Notification Toast */}
      <NotificationToast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: null, type: 'success' })}
      />
    </div>
  );
}
