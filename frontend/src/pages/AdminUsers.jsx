import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Eye, Shield, Store, User, Star, RotateCcw } from 'lucide-react';
import Navbar from '../components/Navbar';
import Table from '../components/Table';
import SearchFilterBar from '../components/SearchFilterBar';
import AddUserModal from '../components/AddUserModal';
import UserDetailsModal from '../components/UserDetailsModal';
import StarRating from '../components/StarRating';
import NotificationToast from '../components/NotificationToast';
import { adminService } from '../services/adminService';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Sorting state
  const [search, setSearch] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [emailFilter, setEmailFilter] = useState('');
  const [addressFilter, setAddressFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('ASC');

  // Modals state
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [toast, setToast] = useState({ message: null, type: 'success' });

  useEffect(() => {
    loadUsers();
  }, [search, nameFilter, emailFilter, addressFilter, roleFilter, sortBy, sortOrder]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await adminService.getUsers({
        search,
        name: nameFilter,
        email: emailFilter,
        address: addressFilter,
        role: roleFilter,
        sortBy,
        sortOrder
      });
      if (res.success) {
        setUsers(res.users || []);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
      setToast({ message: 'Failed to fetch user listing.', type: 'error' });
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
    setRoleFilter('');
    setSortBy('name');
    setSortOrder('ASC');
  };

  const handleViewDetails = (userId) => {
    setSelectedUserId(userId);
    setIsDetailsOpen(true);
  };

  // Define Table Columns
  const columns = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (u) => (
        <div>
          <span className="font-semibold text-slate-900 block">{u.name}</span>
          <span className="text-[11px] text-slate-400">ID #{u.id}</span>
        </div>
      )
    },
    {
      key: 'email',
      header: 'Email',
      sortable: true,
      render: (u) => <span className="text-slate-600 text-xs font-mono">{u.email}</span>
    },
    {
      key: 'address',
      header: 'Address',
      sortable: true,
      render: (u) => (
        <span className="text-slate-600 text-xs line-clamp-2 max-w-xs" title={u.address}>
          {u.address}
        </span>
      )
    },
    {
      key: 'role',
      header: 'Role',
      sortable: true,
      render: (u) => {
        switch (u.role) {
          case 'admin':
            return (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                <Shield className="w-3 h-3" />
                Admin
              </span>
            );
          case 'owner':
            return (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                <Store className="w-3 h-3" />
                Store Owner
              </span>
            );
          case 'user':
          default:
            return (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <User className="w-3 h-3" />
                User
              </span>
            );
        }
      }
    },
    {
      key: 'rating',
      header: 'Store Rating',
      sortable: true,
      render: (u) => {
        if (u.role === 'owner') {
          return u.store_rating !== null ? (
            <div className="flex items-center gap-1.5">
              <StarRating rating={u.store_rating} size="sm" />
              <span className="font-bold text-xs text-slate-800">
                {Number(u.store_rating).toFixed(1)}
              </span>
              <span className="text-[10px] text-slate-400">
                ({u.store_rating_count || 0})
              </span>
            </div>
          ) : (
            <span className="text-xs text-slate-400 italic">No ratings yet</span>
          );
        }
        return <span className="text-xs text-slate-300 font-mono">—</span>;
      }
    },
    {
      key: 'actions',
      header: 'Action',
      sortable: false,
      render: (u) => (
        <button
          type="button"
          onClick={() => handleViewDetails(u.id)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-brand-600 hover:bg-brand-50 border border-brand-200/80 transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          View Details
        </button>
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
              <span className="p-1 rounded-md bg-purple-100 text-purple-700">
                <Users className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-700">
                Administration
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
              User Management
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage accounts, filter by role or details, and view store ratings for Store Owners
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddUserOpen(true)}
            className="btn-primary text-xs self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4 mr-1.5" />
            Add New User
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
            roleFilter={roleFilter}
            onRoleFilterChange={setRoleFilter}
            showRoleFilter={true}
            onReset={handleResetFilters}
          />
        </div>

        {/* Data Table */}
        <Table
          columns={columns}
          data={users}
          loading={loading}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          emptyMessage="No users found matching the filter criteria."
        />
      </main>

      {/* Modals */}
      <AddUserModal
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
        onSuccess={(msg) => {
          setToast({ message: msg, type: 'success' });
          loadUsers();
        }}
      />

      <UserDetailsModal
        userId={selectedUserId}
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedUserId(null);
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
