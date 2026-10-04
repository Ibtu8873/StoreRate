import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Building2, Star, UserPlus, PlusCircle, ArrowRight, ShieldCheck, TrendingUp } from 'lucide-react';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import AddUserModal from '../components/AddUserModal';
import AddStoreModal from '../components/AddStoreModal';
import NotificationToast from '../components/NotificationToast';
import { adminService } from '../services/adminService';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isAddStoreOpen, setIsAddStoreOpen] = useState(false);
  const [toast, setToast] = useState({ message: null, type: 'success' });

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      const res = await adminService.getDashboardStats();
      if (res.success && res.stats) {
        setStats(res.stats);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
      setToast({ message: 'Failed to load administrator statistics.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleActionSuccess = (msg) => {
    setToast({ message: msg, type: 'success' });
    loadDashboardStats();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar onPasswordSuccess={(msg) => setToast({ message: msg, type: 'success' })} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-purple-100 text-purple-700">
                <ShieldCheck className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-700">
                Administrator Control Center
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Platform Overview
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Live statistics and administrative controls for RateHub
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsAddUserOpen(true)}
              className="btn-secondary text-xs"
            >
              <UserPlus className="w-4 h-4 mr-1.5 text-brand-600" />
              Add User
            </button>
            <button
              type="button"
              onClick={() => setIsAddStoreOpen(true)}
              className="btn-primary text-xs"
            >
              <PlusCircle className="w-4 h-4 mr-1.5" />
              Add Store
            </button>
          </div>
        </div>

        {/* 3 Main Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard
            title="Total Registered Users"
            value={stats.totalUsers}
            icon={Users}
            description="Administrators, Normal Users & Store Owners"
            color="purple"
          />
          <StatCard
            title="Total Registered Stores"
            value={stats.totalStores}
            icon={Building2}
            description="Verified retail storefronts"
            color="blue"
          />
          <StatCard
            title="Total Submitted Ratings"
            value={stats.totalRatings}
            icon={Star}
            description="Community reviews and scores"
            color="amber"
          />
        </div>

        {/* Management Quick Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Management Section Card */}
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">User Management</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
                View all registered users with role-based filtering and sorting by Name, Email, Address, and Role.
                Inspect comprehensive user details and view Store Owner store ratings.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsAddUserOpen(true)}
                className="text-xs font-semibold text-purple-700 hover:text-purple-800"
              >
                + Create User
              </button>
              <Link
                to="/admin/users"
                className="btn-primary text-xs"
              >
                Manage Users
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Link>
            </div>
          </div>

          {/* Store Management Section Card */}
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                <Building2 className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Store Management</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
                Register new stores, assign Store Owners, and view the store directory with sorting and filtering across Name, Email, Address, and Overall Rating.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsAddStoreOpen(true)}
                className="text-xs font-semibold text-indigo-700 hover:text-indigo-800"
              >
                + Create Store
              </button>
              <Link
                to="/admin/stores"
                className="btn-primary text-xs"
              >
                Manage Stores
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <AddUserModal
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
        onSuccess={handleActionSuccess}
      />
      <AddStoreModal
        isOpen={isAddStoreOpen}
        onClose={() => setIsAddStoreOpen(false)}
        onSuccess={handleActionSuccess}
      />

      <NotificationToast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: null, type: 'success' })}
      />
    </div>
  );
}
