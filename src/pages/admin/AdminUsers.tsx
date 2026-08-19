import React, { useState, useEffect, useCallback } from 'react';
import { usersApi } from '../../api/users.api';
import { useToast } from '../../components/ui/Toast';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Card } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { ApiError } from '../../types/api';
import type { UserSummary, UserStatus, FindUsersQuery } from '../../types/user';
import {
  Users,
  Search,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  UserX,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Clock,
  ShieldAlert,
} from 'lucide-react';

export const AdminUsers: React.FC = () => {
  const { showToast } = useToast();

  // Data & Pagination State
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [pageSize] = useState<number>(10);

  // Filter & Search State
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<UserStatus | ''>('');
  const [sortField, setSortField] = useState<'createdAt' | 'displayName' | 'email'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Loading & Error States
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState<boolean>(false);

  // Modals State
  const [detailsModalUser, setDetailsModalUser] = useState<UserSummary | null>(null);
  const [statusModalUser, setStatusModalUser] = useState<UserSummary | null>(null);
  const [targetStatus, setTargetStatus] = useState<UserStatus>('ACTIVE');
  const [deleteModalUser, setDeleteModalUser] = useState<UserSummary | null>(null);

  // Debounce search term changes (400ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setCurrentPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  /**
   * Fetches users list from the backend API according to query parameters.
   */
  const fetchUsers = useCallback(
    async (showSilentRefresh = false) => {
      if (showSilentRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setLoadError(null);

      try {
        const queryParams: FindUsersQuery = {
          page: currentPage,
          limit: pageSize,
          search: debouncedSearch || undefined,
          status: selectedStatus || undefined,
          sortField,
          sortOrder,
        };

        const response = await usersApi.getUsers(queryParams);
        const data = response.data;

        setUsers(data.items || []);
        setTotalCount(data.total ?? data.items?.length ?? 0);
        setTotalPages(data.pages ?? Math.ceil((data.total ?? 1) / pageSize) ?? 1);
      } catch (err: unknown) {
        const message = ApiError.isApiError(err)
          ? err.message
          : err instanceof Error
          ? err.message
          : 'Failed to fetch users directory from server.';
        setLoadError(message);
        showToast(message, 'error');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [currentPage, pageSize, debouncedSearch, selectedStatus, sortField, sortOrder, showToast]
  );

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  /**
   * Handles user status transition (ACTIVE <-> INACTIVE <-> SUSPENDED).
   */
  const handleUpdateStatus = async () => {
    if (!statusModalUser) return;
    setIsMutating(true);

    try {
      await usersApi.updateUserStatus(statusModalUser.id, { status: targetStatus });
      showToast(`User status successfully updated to ${targetStatus}.`, 'success');
      setStatusModalUser(null);
      await fetchUsers(true);
    } catch (err: unknown) {
      const message = ApiError.isApiError(err)
        ? err.message
        : err instanceof Error
        ? err.message
        : 'Failed to update user status.';
      showToast(message, 'error');
    } finally {
      setIsMutating(false);
    }
  };

  /**
   * Handles user soft-deletion / archiving.
   */
  const handleSoftDelete = async () => {
    if (!deleteModalUser) return;
    setIsMutating(true);

    try {
      await usersApi.softDeleteUser(deleteModalUser.id);
      showToast('User account successfully archived.', 'success');
      setDeleteModalUser(null);
      await fetchUsers(true);
    } catch (err: unknown) {
      const message = ApiError.isApiError(err)
        ? err.message
        : err instanceof Error
        ? err.message
        : 'Failed to archive user account.';
      showToast(message, 'error');
    } finally {
      setIsMutating(false);
    }
  };

  // Calculate high-level summary metrics from loaded items
  const activeCount = users.filter((u) => u.status === 'ACTIVE').length;
  const suspendedCount = users.filter((u) => u.status === 'SUSPENDED' || u.status === 'INACTIVE').length;
  const adminCount = users.filter((u) =>
    u.roles.some((r) => r.code === 'SUPER_ADMIN' || r.code === 'ADMIN' || r.name === 'Super Admin' || r.name === 'Admin')
  ).length;

  /**
   * Formats role badge styling and label.
   */
  const renderRoleBadges = (roles: UserSummary['roles']) => {
    if (!roles || roles.length === 0) {
      return <span className="text-xs text-slate-400">No Role</span>;
    }

    return (
      <div className="flex flex-wrap gap-1">
        {roles.map((role) => {
          const isSuper = role.code === 'SUPER_ADMIN' || role.name === 'Super Admin';
          const isAdmin = role.code === 'ADMIN' || role.name === 'Admin';
          return (
            <Badge
              key={role.id || role.code}
              variant={isSuper ? 'secondary' : isAdmin ? 'primary' : 'outline'}
              className="text-[10px] tracking-wide font-mono uppercase px-2 py-0.5"
            >
              {isSuper ? '👑 ' : ''}
              {role.name || role.code}
            </Badge>
          );
        })}
      </div>
    );
  };

  /**
   * Formats status badge styling.
   */
  const renderStatusBadge = (status: UserStatus) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <Badge variant="success" className="text-[11px] font-medium inline-flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> Active
          </Badge>
        );
      case 'INACTIVE':
        return (
          <Badge variant="warning" className="text-[11px] font-medium inline-flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" /> Inactive
          </Badge>
        );
      case 'SUSPENDED':
        return (
          <Badge variant="danger" className="text-[11px] font-medium inline-flex items-center gap-1">
            <UserX className="h-3 w-3" /> Suspended
          </Badge>
        );
      case 'ARCHIVED':
        return (
          <Badge variant="outline" className="text-[11px] font-medium inline-flex items-center gap-1">
            <Clock className="h-3 w-3" /> Archived
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-6 w-6 text-secondary" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-heading">
              User Management
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Enterprise user directory, identity verification, role allocations, and lifecycle status controls.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchUsers(true)}
            disabled={isLoading || isRefreshing}
            className="flex items-center gap-1.5 text-xs font-semibold"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Metric Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-4">
          <div className="p-3 bg-secondary/10 rounded-xl text-secondary">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">Total Users</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white font-heading">{totalCount}</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400">
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">Active (Page)</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-heading">{activeCount}</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 rounded-xl text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">Inactive/Suspended</p>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 font-heading">{suspendedCount}</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">Administrators</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 font-heading">{adminCount}</p>
          </div>
        </Card>
      </div>

      {/* Filter & Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email or display name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg outline-none text-slate-900 dark:text-white focus:border-secondary transition-colors"
            />
          </div>

          {/* Filters & Sorting */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value as UserStatus | '');
                  setCurrentPage(1);
                }}
                className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg outline-none text-slate-900 dark:text-white focus:border-secondary cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>

            {/* Sort Field */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Sort:</span>
              <select
                value={`${sortField}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-') as [
                    'createdAt' | 'displayName' | 'email',
                    'asc' | 'desc'
                  ];
                  setSortField(field);
                  setSortOrder(order);
                  setCurrentPage(1);
                }}
                className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg outline-none text-slate-900 dark:text-white focus:border-secondary cursor-pointer"
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="displayName-asc">Name (A-Z)</option>
                <option value="displayName-desc">Name (Z-A)</option>
                <option value="email-asc">Email (A-Z)</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Users Table */}
      <Card className="overflow-hidden">
        {/* Error State Banner */}
        {loadError && (
          <div className="p-4 bg-red-500/10 border-b border-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <span>{loadError}</span>
            </div>
            <Button size="sm" variant="danger" onClick={() => fetchUsers()}>
              Retry
            </Button>
          </div>
        )}

        {/* Loading Skeletons */}
        {isLoading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : users.length === 0 ? (
          /* Empty State */
          <div className="py-16 text-center text-slate-400">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200">No users found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              No user accounts match the selected search or filter criteria. Try adjusting your query parameters.
            </p>
            {(searchTerm || selectedStatus) && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedStatus('');
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          /* Data Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 dark:bg-slate-900/50 text-slate-400 border-b border-slate-100 dark:border-slate-800 font-mono uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4 font-semibold">User Identity</th>
                  <th className="py-3 px-4 font-semibold">Assigned Roles</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Joined Date</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {users.map((user) => {
                  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || 'U';
                  const isProtected =
                    user.roles.some((r) => r.code === 'SUPER_ADMIN') || user.email === 'admin@devolatical.com';

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      {/* Identity */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-secondary/30 to-blue-500/30 border border-secondary/20 flex items-center justify-center font-bold text-secondary text-xs flex-shrink-0">
                            {user.avatarUrl ? (
                              <img src={user.avatarUrl} alt={user.displayName} className="h-9 w-9 rounded-full object-cover" />
                            ) : (
                              initials
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                              {user.displayName || `${user.firstName} ${user.lastName}`}
                              {isProtected && (
                                <span title="Protected System Account" className="cursor-help text-secondary text-xs">
                                  🛡️
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">{user.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Roles */}
                      <td className="py-3.5 px-4">{renderRoleBadges(user.roles)}</td>

                      {/* Status */}
                      <td className="py-3.5 px-4">{renderStatusBadge(user.status)}</td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                        {new Date(user.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Details */}
                          <button
                            type="button"
                            onClick={() => setDetailsModalUser(user)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="View Full Profile"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          {/* Change Status */}
                          <button
                            type="button"
                            onClick={() => {
                              setStatusModalUser(user);
                              setTargetStatus(user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE');
                            }}
                            className="p-1.5 text-slate-400 hover:text-secondary rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Change Account Status"
                          >
                            <UserCheck className="h-4 w-4" />
                          </button>

                          {/* Soft Delete */}
                          <button
                            type="button"
                            onClick={() => setDeleteModalUser(user)}
                            disabled={isProtected}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isProtected
                                ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed opacity-40'
                                : 'text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30'
                            }`}
                            title={isProtected ? 'Protected system account cannot be archived' : 'Archive User'}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {!isLoading && users.length > 0 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              Showing <span className="font-semibold text-slate-800 dark:text-slate-200">{(currentPage - 1) * pageSize + 1}</span> to{' '}
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {Math.min(currentPage * pageSize, totalCount)}
              </span>{' '}
              of <span className="font-semibold text-slate-800 dark:text-slate-200">{totalCount}</span> entries
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className="p-1.5"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded font-mono text-slate-800 dark:text-slate-200">
                {currentPage} / {totalPages || 1}
              </span>

              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                className="p-1.5"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* ========================================================= */}
      {/* 1. User Details Modal */}
      {/* ========================================================= */}
      <Modal
        isOpen={!!detailsModalUser}
        onClose={() => setDetailsModalUser(null)}
        title="User Identity & Clearance"
      >
        {detailsModalUser && (
          <div className="space-y-5 text-left text-xs">
            {/* Header info */}
            <div className="flex items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-secondary/30 to-blue-500/30 border border-secondary/30 flex items-center justify-center font-bold text-secondary text-base">
                {`${detailsModalUser.firstName?.[0] || ''}${detailsModalUser.lastName?.[0] || ''}`.toUpperCase() || 'U'}
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  {detailsModalUser.displayName || `${detailsModalUser.firstName} ${detailsModalUser.lastName}`}
                </h4>
                <p className="text-slate-400 font-mono text-xs">{detailsModalUser.email}</p>
              </div>
            </div>

            {/* Attributes Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-dark p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block mb-1">
                  Account Status
                </span>
                {renderStatusBadge(detailsModalUser.status)}
              </div>

              <div className="bg-slate-50 dark:bg-dark p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block mb-1">
                  System ID
                </span>
                <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300 break-all select-all">
                  {detailsModalUser.id}
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-dark p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block mb-1">
                  Registration Date
                </span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  {new Date(detailsModalUser.createdAt).toLocaleString()}
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-dark p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block mb-1">
                  First & Last Name
                </span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  {detailsModalUser.firstName} {detailsModalUser.lastName}
                </span>
              </div>
            </div>

            {/* Assigned Roles */}
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block mb-2">
                Assigned Roles & Access Policies
              </span>
              <div className="p-3 bg-slate-50 dark:bg-dark rounded-lg border border-slate-100 dark:border-slate-800 flex flex-wrap gap-2">
                {renderRoleBadges(detailsModalUser.roles)}
              </div>
            </div>

            {/* Footer actions */}
            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" size="sm" onClick={() => setDetailsModalUser(null)}>
                Close
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  const target = detailsModalUser;
                  setDetailsModalUser(null);
                  setStatusModalUser(target);
                  setTargetStatus(target.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE');
                }}
              >
                Change Status
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ========================================================= */}
      {/* 2. Status Transition Modal */}
      {/* ========================================================= */}
      <Modal
        isOpen={!!statusModalUser}
        onClose={() => !isMutating && setStatusModalUser(null)}
        title="Update Account Lifecycle Status"
      >
        {statusModalUser && (
          <div className="space-y-4 text-left text-xs">
            <p className="text-slate-650 dark:text-slate-300">
              Modify account clearance for{' '}
              <strong className="text-slate-900 dark:text-white font-semibold">
                {statusModalUser.displayName || statusModalUser.email}
              </strong>
              . This will immediately affect API session access and route authorization.
            </p>

            <div className="p-3 bg-slate-50 dark:bg-dark rounded-lg border border-slate-100 dark:border-slate-800 space-y-2">
              <label className="block text-[10px] uppercase font-mono text-slate-400 tracking-wider">
                Select Target Status
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['ACTIVE', 'INACTIVE', 'SUSPENDED'] as UserStatus[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setTargetStatus(st)}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      targetStatus === st
                        ? 'border-secondary bg-secondary/10 text-secondary'
                        : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {targetStatus === 'SUSPENDED' && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 dark:text-red-400 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Warning:</strong> Suspending this account will immediately revoke authentication tokens and block all portal requests.
                </span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="outline"
                size="sm"
                disabled={isMutating}
                onClick={() => setStatusModalUser(null)}
              >
                Cancel
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={isMutating || targetStatus === statusModalUser.status}
                onClick={handleUpdateStatus}
              >
                {isMutating ? 'Applying...' : 'Apply Status Change'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ========================================================= */}
      {/* 3. Soft Delete Confirmation Modal */}
      {/* ========================================================= */}
      <Modal
        isOpen={!!deleteModalUser}
        onClose={() => !isMutating && setDeleteModalUser(null)}
        title="Archive User Account"
      >
        {deleteModalUser && (
          <div className="space-y-4 text-left text-xs">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-600 dark:text-amber-400 flex items-start gap-2">
              <ShieldAlert className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm">Are you sure you want to archive this user?</p>
                <p className="mt-1 text-[11px] leading-relaxed">
                  User <strong className="text-slate-900 dark:text-white">{deleteModalUser.displayName || deleteModalUser.email}</strong> will be soft-deleted. Their status will transition to ARCHIVED, revoking access to all enterprise portals.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="outline"
                size="sm"
                disabled={isMutating}
                onClick={() => setDeleteModalUser(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                disabled={isMutating}
                onClick={handleSoftDelete}
              >
                {isMutating ? 'Archiving...' : 'Confirm Archival'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminUsers;
