import React from 'react';
import { Search, Filter, X } from 'lucide-react';

export default function SearchFilterBar({
  search = '',
  onSearchChange,
  nameFilter = '',
  onNameFilterChange,
  addressFilter = '',
  onAddressFilterChange,
  emailFilter = '',
  onEmailFilterChange,
  roleFilter = '',
  onRoleFilterChange,
  showRoleFilter = false,
  showDetailedFilters = true,
  onReset
}) {
  const hasActiveFilters = search || nameFilter || addressFilter || emailFilter || roleFilter;

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
      {/* General Search Input */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Quick search by name or address..."
            className="w-full pl-9 pr-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
          />
        </div>

        {hasActiveFilters && onReset && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors self-end sm:self-auto"
          >
            <X className="w-3.5 h-3.5" />
            Clear Filters
          </button>
        )}
      </div>

      {/* Detailed Filters row */}
      {showDetailedFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100 text-xs">
          {onNameFilterChange && (
            <div>
              <input
                type="text"
                value={nameFilter}
                onChange={(e) => onNameFilterChange(e.target.value)}
                placeholder="Filter by Name..."
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs"
              />
            </div>
          )}

          {onAddressFilterChange && (
            <div>
              <input
                type="text"
                value={addressFilter}
                onChange={(e) => onAddressFilterChange(e.target.value)}
                placeholder="Filter by Address..."
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs"
              />
            </div>
          )}

          {onEmailFilterChange && (
            <div>
              <input
                type="text"
                value={emailFilter}
                onChange={(e) => onEmailFilterChange(e.target.value)}
                placeholder="Filter by Email..."
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs"
              />
            </div>
          )}

          {showRoleFilter && onRoleFilterChange && (
            <div>
              <select
                value={roleFilter}
                onChange={(e) => onRoleFilterChange(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs"
              >
                <option value="">All Roles</option>
                <option value="admin">Administrator</option>
                <option value="user">Normal User</option>
                <option value="owner">Store Owner</option>
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
