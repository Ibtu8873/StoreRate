import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Star, LogOut, KeyRound, User, Shield, Store, Building2, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PasswordModal from './PasswordModal';

export default function Navbar({ onPasswordSuccess }) {
  const { user, role, logout } = useAuth();
  const location = useLocation();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const getRoleBadge = (r) => {
    switch (r) {
      case 'admin':
        return {
          label: 'Administrator',
          icon: Shield,
          color: 'bg-purple-100 text-purple-700 border-purple-200'
        };
      case 'owner':
        return {
          label: 'Store Owner',
          icon: Store,
          color: 'bg-blue-100 text-blue-700 border-blue-200'
        };
      case 'user':
      default:
        return {
          label: 'Normal User',
          icon: User,
          color: 'bg-emerald-100 text-emerald-700 border-emerald-200'
        };
    }
  };

  const badge = getRoleBadge(role);
  const BadgeIcon = badge.icon;

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-6">
              <Link to="/" className="flex items-center gap-2.5 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
                  <Star className="w-5 h-5 fill-white" />
                </div>
                <div>
                  <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-brand-900 bg-clip-text text-transparent">
                    Rate<span className="text-brand-600">Hub</span>
                  </span>
                  <span className="block text-[10px] uppercase tracking-widest font-semibold text-slate-400 -mt-1">
                    Store Rating Platform
                  </span>
                </div>
              </Link>

              {/* Navigation Links for Admin */}
              {role === 'admin' && (
                <nav className="hidden md:flex items-center gap-1 ml-4 border-l border-slate-200 pl-4">
                  <Link
                    to="/admin/dashboard"
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/admin/dashboard')
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/admin/users"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/admin/users')
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    User Management
                  </Link>
                  <Link
                    to="/admin/stores"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/admin/stores')
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    Store Management
                  </Link>
                </nav>
              )}
            </div>

            {/* User Profile & Actions */}
            <div className="flex items-center gap-3">
              {/* Role Badge */}
              <div className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.color}`}>
                <BadgeIcon className="w-3.5 h-3.5" />
                <span>{badge.label}</span>
              </div>

              {/* User Name */}
              <div className="hidden lg:block text-right">
                <span className="block text-xs font-semibold text-slate-800 line-clamp-1 max-w-[200px]">
                  {user?.name}
                </span>
                <span className="block text-[11px] text-slate-400 line-clamp-1">
                  {user?.email}
                </span>
              </div>

              {/* Change Password Button */}
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(true)}
                className="p-2 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                title="Change Password"
                aria-label="Change Password"
              >
                <KeyRound className="w-4 h-4" />
              </button>

              {/* Logout Button */}
              <button
                type="button"
                onClick={logout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200/80 transition-colors"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Password Change Modal */}
      <PasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSuccess={(msg) => {
          if (onPasswordSuccess) onPasswordSuccess(msg);
        }}
      />
    </>
  );
}
