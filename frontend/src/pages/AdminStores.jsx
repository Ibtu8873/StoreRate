import React, { useState, useEffect } from 'react';
import { Building2, PlusCircle, Star, Mail, MapPin, User } from 'lucide-react';
import Navbar from '../components/Navbar';
import Table from '../components/Table';
import SearchFilterBar from '../components/SearchFilterBar';
import AddStoreModal from '../components/AddStoreModal';
import StarRating from '../components/StarRating';
import NotificationToast from '../components/NotificationToast';
import { adminService } from '../services/adminService';

export default function AdminStores() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Sorting state
  const [search, setSearch] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [emailFilter, setEmailFilter] = useState('');
  const [addressFilter, setAddressFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('ASC');

  // Modals state
  const [isAddStoreOpen, setIsAddStoreOpen] = useState(false);
  const [toast, setToast] = useState({ message: null, type: 'success' });

  useEffect(() => {
    loadStores();
  }, [search, nameFilter, emailFilter, addressFilter, sortBy, sortOrder]);

  const loadStores = async () => {
    try {
      setLoading(true);
      const res = await adminService.getStores({
        search,
        name: nameFilter,
        email: emailFilter,
        address: addressFilter,
        sortBy,
        sortOrder
      });
      if (res.success) {
        setStores(res.stores || []);
      }
    } catch (err) {
      console.error('Failed to load stores:', err);
      setToast({ message: 'Failed to fetch store listing.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (columnKey) => {
    if (sortBy === columnKey) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(columnKey);
      setSortOrder('ASC');
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setNameFilter('');
    setEmailFilter('');
    setAddressFilter('');
    setSortBy('name');
    setSortOrder('ASC');
  };

  // Table Columns
  const columns = [
    {
      key: 'name',
      header: 'Store Name',
      sortable: true,
      render: (s) => (
        <div>
          <span className="font-semibold text-slate-900 block">{s.name}</span>
          <span className="text-[11px] text-slate-400">Owner: {s.owner_name}</span>
        </div>
      )
    },
    {
      key: 'email',
      header: 'Email',
      sortable: true,
      render: (s) => <span className="text-slate-600 text-xs font-mono">{s.email}</span>
    },
    {
      key: 'address',
      header: 'Address',
      sortable: true,
      render: (s) => (
        <span className="text-slate-600 text-xs line-clamp-2 max-w-xs" title={s.address}>
          {s.address}
        </span>
      )
    },
    {
      key: 'rating',
      header: 'Overall Rating',
      sortable: true,
      render: (s) => (
        <div className="flex items-center gap-2">
          <StarRating rating={s.overall_rating || 0} size="sm" />
          <span className="font-bold text-xs text-slate-900">
            {s.overall_rating ? Number(s.overall_rating).toFixed(1) : 'No ratings'}
          </span>
          <span className="text-[10px] text-slate-400">
            ({s.total_ratings || 0})
          </span>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar onPasswordSuccess={(msg) => setToast({ message: msg, type: 'success' })} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-indigo-100 text-indigo-700">
                <Building2 className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                Administration
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
              Store Management
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage retail store listings, assigned owners, and overall customer satisfaction ratings
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddStoreOpen(true)}
            className="btn-primary text-xs self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4 mr-1.5" />
            Add New Store
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="mb-6">
          <SearchFilterBar
            search={search}
            onSearchChange={setSearch}
            nameFilter={nameFilter}
            onNameFilterChange={setNameFilter}
            emailFilter={emailFilter}
            onEmailFilterChange={setEmailFilter}
            addressFilter={addressFilter}
            onAddressFilterChange={setAddressFilter}
            showRoleFilter={false}
            onReset={handleResetFilters}
          />
        </div>

        {/* Data Table */}
        <Table
          columns={columns}
          data={stores}
          loading={loading}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          emptyMessage="No stores found matching the filter criteria."
        />
      </main>

      {/* Add Store Modal */}
      <AddStoreModal
        isOpen={isAddStoreOpen}
        onClose={() => setIsAddStoreOpen(false)}
        onSuccess={(msg) => {
          setToast({ message: msg, type: 'success' });
          loadStores();
        }}
      />

      <NotificationToast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: null, type: 'success' })}
      />
    </div>
  );
}
