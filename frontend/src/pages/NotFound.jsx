import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Home, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function NotFound() {
  const { role, getRoleDashboard } = useAuth();
  const homePath = role ? getRoleDashboard(role) : '/login';

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-5">
        <div className="w-16 h-16 rounded-3xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto shadow-inner">
          <Star className="w-8 h-8 fill-brand-600" />
        </div>
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">404</h1>
          <h2 className="text-lg font-bold text-slate-700 mt-2">Page Not Found</h2>
          <p className="text-xs text-slate-500 mt-1">
            The page you are trying to visit does not exist or has been moved.
          </p>
        </div>
        <div className="pt-2">
          <Link
            to={homePath}
            className="btn-primary inline-flex items-center gap-2 text-xs"
          >
            <Home className="w-4 h-4" />
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
