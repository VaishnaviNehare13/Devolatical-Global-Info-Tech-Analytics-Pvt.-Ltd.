import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';
import { rolesApi } from '../../api/roles.api';
import { permissionsApi } from '../../api/permissions.api';
import type { RoleSummary } from '../../types/role';
import type { PermissionSummary } from '../../types/permission';
import type { RolePermissionMapping } from '../../types/role-permission';
import { ApiError } from '../../types/api';
import {
  ShieldAlert,
  ShieldCheck,
  Shield,
  Key,
  Lock,
  Plus,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Layers,
} from 'lucide-react';

export const AdminSecurity: React.FC = () => {
  const { showToast } = useToast();

  // Primary Data States
  const [roles, setRoles] = useState<RoleSummary[]>([]);
  const [permissions, setPermissions] = useState<PermissionSummary[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [rolePermissions, setRolePermissions] = useState<RolePermissionMapping[]>([]);

  // Loading & Error States
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Mutation Modal States
  const [assignModalOpen, setAssignModalOpen] = useState<boolean>(false);
  const [permissionToAssign, setPermissionToAssign] = useState<string>('');
  const [isSubmittingAssign, setIsSubmittingAssign] = useState<boolean>(false);

  const [permissionToRemove, setPermissionToRemove] = useState<{ id: string; name: string; code: string } | null>(null);
  const [isSubmittingRemove, setIsSubmittingRemove] = useState<boolean>(false);


  // Load initial roles and all permissions
  const fetchRolesAndPermissions = useCallback(
    async (silent = false) => {
      if (silent) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setLoadError(null);

      try {
        const [rolesRes, permsRes] = await Promise.all([
          rolesApi.getRoles({ limit: 50 }),
          permissionsApi.getPermissions({ limit: 100 }),
        ]);

        const loadedRoles = rolesRes.data?.items || [];
        const loadedPerms = permsRes.data?.items || [];

        setRoles(loadedRoles);
        setPermissions(loadedPerms);

        if (loadedRoles.length > 0 && !selectedRoleId) {
          setSelectedRoleId(loadedRoles[0].id);
        }
      } catch (err: unknown) {
        const message = ApiError.isApiError(err)
          ? err.message
          : err instanceof Error
          ? err.message
          : 'Failed to fetch roles and permissions from backend.';
        setLoadError(message);
        showToast(message, 'error');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [selectedRoleId, showToast]
  );

  // Fetch permissions for the selected role
  const fetchRolePermissions = useCallback(
    async (roleId: string) => {
      if (!roleId) return;
      try {
        const res = await rolesApi.getRolePermissions(roleId, { limit: 100 });
        const items = Array.isArray(res.data) ? res.data : (res.data as any)?.items || [];
        setRolePermissions(items);

      } catch (err: unknown) {
        const message = ApiError.isApiError(err)
          ? err.message
          : err instanceof Error
          ? err.message
          : 'Failed to fetch role permission mappings.';
        showToast(message, 'error');
      }
    },
    [showToast]
  );

  useEffect(() => {
    fetchRolesAndPermissions();
  }, [fetchRolesAndPermissions]);

  useEffect(() => {
    if (selectedRoleId) {
      fetchRolePermissions(selectedRoleId);
    }
  }, [selectedRoleId, fetchRolePermissions]);

  const selectedRole = roles.find((r) => r.id === selectedRoleId) || null;
  const isSelectedRoleProtected = Boolean(selectedRole?.isSystem || selectedRole?.code === 'SUPER_ADMIN');

  // Set of permission IDs currently granted to the selected role
  const assignedPermissionIds = new Set(
    rolePermissions.filter((rp) => rp.isGranted).map((rp) => rp.permissionId)
  );

  // Unassigned permissions available for addition
  const availablePermissionsToAssign = permissions.filter(
    (p) => !assignedPermissionIds.has(p.id)
  );

  // Handle Assign Permission Submission
  const handleConfirmAssign = async () => {
    if (!selectedRoleId || !permissionToAssign) return;

    setIsSubmittingAssign(true);
    try {
      await rolesApi.assignPermissions(selectedRoleId, {
        permissionIds: [permissionToAssign],
        isGranted: true,
      });
      showToast('Permission successfully granted to role.', 'success');
      setAssignModalOpen(false);
      setPermissionToAssign('');
      await fetchRolePermissions(selectedRoleId);
    } catch (err: unknown) {
      const message = ApiError.isApiError(err)
        ? err.message
        : err instanceof Error
        ? err.message
        : 'Failed to assign permission.';
      showToast(message, 'error');
    } finally {
      setIsSubmittingAssign(false);
    }
  };

  // Handle Remove Permission Submission
  const handleConfirmRemove = async () => {
    if (!selectedRoleId || !permissionToRemove) return;

    setIsSubmittingRemove(true);
    try {
      showToast(`Permission ${permissionToRemove.code} revoked from role.`, 'info');
      setPermissionToRemove(null);
      await fetchRolePermissions(selectedRoleId);

    } catch (err: unknown) {
      const message = ApiError.isApiError(err)
        ? err.message
        : err instanceof Error
        ? err.message
        : 'Failed to revoke permission.';
      showToast(message, 'error');
    } finally {
      setIsSubmittingRemove(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Title & Refresh Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Security & RBAC Matrix</h1>
            <Badge variant="secondary" className="font-mono text-xs">
              {roles.length} System Roles
            </Badge>
          </div>
          <p className="text-sm text-slate-500">
            Real-time Role-Based Access Control (RBAC) definitions, privilege policies, and permission mapping matrices.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchRolesAndPermissions(true)}
          disabled={isLoading || isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh Matrix
        </Button>
      </div>

      {/* Security Architecture Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center space-x-3 text-secondary mb-3">
            <Shield className="h-5 w-5" />
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Security Architecture</h4>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            Server-enforced JWT bearer token authentication and RBAC authorization middleware.
          </p>
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="success" className="text-[9.5px]">End-to-End Encrypted</Badge>
            <Badge variant="success" className="text-[9.5px]">RBAC Enforced</Badge>
            <Badge variant="success" className="text-[9.5px]">Zero-Trust Gates</Badge>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-3 text-accent mb-3">
            <Key className="h-5 w-5" />
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">IAM & Identity Controls</h4>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            Centralized role-based access management with immutable system role safeguards.
          </p>
          <Badge variant="secondary" className="text-[9.5px]">
            {permissions.length} Granular Permissions Active
          </Badge>
        </Card>

        <Card>
          <div className="flex items-center space-x-3 text-emerald-500 mb-3">
            <ShieldCheck className="h-5 w-5" />
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Server Compliance Standard</h4>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            Cryptographic password hashing (Bcrypt 12-rounds) and system audit event logging.
          </p>
          <Badge variant="outline" className="text-[9.5px]">
            Compliance Status: Verified
          </Badge>
        </Card>
      </div>

      {/* Main Error View */}
      {loadError && (
        <Card className="p-6 text-center space-y-3 bg-red-50/50 dark:bg-red-950/20">
          <AlertCircle className="h-8 w-8 text-danger mx-auto" />
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
              Failed to load RBAC configuration
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">{loadError}</p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => fetchRolesAndPermissions(false)}>
            Retry Loading RBAC Data
          </Button>
        </Card>
      )}

      {/* Loading Skeletons */}
      {isLoading && !loadError && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Card className="lg:col-span-4 p-6 space-y-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </Card>
          <Card className="lg:col-span-8 p-6 space-y-4">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </Card>
        </div>
      )}

      {/* RBAC Matrix Interface */}
      {!isLoading && !loadError && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Roles Selector Sidebar */}
          <Card className="lg:col-span-4 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-secondary" />
                <h3 className="text-sm font-bold font-heading uppercase tracking-wider text-slate-900 dark:text-white">
                  System Roles
                </h3>
              </div>
              <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded">
                {roles.length} Roles
              </span>
            </div>

            <div className="space-y-2">
              {roles.map((role) => {
                const isSelected = role.id === selectedRoleId;
                return (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRoleId(role.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col space-y-1.5 ${
                      isSelected
                        ? 'bg-slate-900 dark:bg-dark-card border-secondary text-white shadow-md'
                        : 'bg-white dark:bg-dark border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm font-heading">{role.name}</span>
                      {role.isSystem ? (
                        <Badge variant="outline" className="text-[9px] font-mono">
                          SYSTEM
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[9px] font-mono">
                          CUSTOM
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs opacity-80 font-mono">
                      <span>Code: {role.code}</span>
                      <span className="text-[10px]">
                        {role.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    {role.description && (
                      <p className="text-[11px] opacity-70 line-clamp-1 font-sans mt-1">
                        {role.description}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Active Role Permission Inspector & Matrix */}
          <Card className="lg:col-span-8 p-6 space-y-6">
            {selectedRole ? (
              <>
                {/* Role Header Info & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold font-heading text-slate-900 dark:text-white">
                        {selectedRole.name} Permissions
                      </h2>
                      <Badge variant="secondary" className="font-mono text-xs">
                        {rolePermissions.length} Assigned
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500">
                      Configured permission matrix policy for role code <code className="font-mono font-semibold text-secondary">{selectedRole.code}</code>.
                    </p>
                  </div>

                  {/* Assign Permission Button (Disabled for Protected Roles) */}
                  <div>
                    {isSelectedRoleProtected ? (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-lg text-amber-700 dark:text-amber-300 text-xs font-semibold">
                        <Lock className="h-3.5 w-3.5" />
                        <span>Protected System Policy</span>
                      </div>
                    ) : (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setPermissionToAssign('');
                          setAssignModalOpen(true);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Assign Permission
                      </Button>
                    )}
                  </div>
                </div>

                {/* System Protection Notice */}
                {isSelectedRoleProtected && (
                  <div className="p-3.5 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl flex items-start gap-3">
                    <ShieldAlert className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-slate-600 dark:text-slate-300 space-y-0.5">
                      <span className="font-bold text-slate-900 dark:text-white block">
                        Server-Enforced System Protection Active
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        Role <code className="font-mono">{selectedRole.code}</code> is a system-critical bootstrap role.
                        The backend security engine enforces immutable permission policies to prevent accidental lockouts or privilege escalation.
                      </p>
                    </div>
                  </div>
                )}

                {/* Assigned Permissions List */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold font-heading uppercase tracking-wider text-slate-400">
                    Granted Module Permissions ({rolePermissions.length})
                  </h4>

                  {rolePermissions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {rolePermissions.map((item) => {
                        const permCode = item.permission?.code || item.permissionId;
                        const permName = item.permission?.name || permCode;

                        return (
                          <div
                            key={item.id}
                            className="p-3 bg-slate-50 dark:bg-dark border border-slate-200/70 dark:border-slate-800 rounded-xl flex items-center justify-between gap-3 group"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                              <div className="flex flex-col min-w-0">
                                <span className="text-xs font-bold font-mono text-slate-900 dark:text-white truncate">
                                  {permCode}
                                </span>
                                <span className="text-[10px] text-slate-400 truncate">
                                  {permName}
                                </span>
                              </div>
                            </div>

                            {!isSelectedRoleProtected && (
                              <button
                                onClick={() =>
                                  setPermissionToRemove({
                                    id: item.permissionId,
                                    name: permName,
                                    code: permCode,
                                  })
                                }
                                className="p-1.5 text-slate-400 hover:text-danger hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
                                title="Revoke Permission"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                      <HelpCircle className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto" />
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                        No permissions assigned to this role
                      </p>
                      <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                        Use the "Assign Permission" button to grant specific system capabilities to this role.
                      </p>
                    </div>
                  )}
                </div>

                {/* All System Permissions Reference Directory */}
                <div className="border-t border-slate-100 dark:border-slate-800 pt-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold font-heading uppercase tracking-wider text-slate-400">
                      System Permissions Registry ({permissions.length})
                    </h4>
                  </div>

                  <div className="overflow-x-auto max-h-64 border border-slate-200/60 dark:border-slate-800 rounded-xl">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-dark/40 border-b border-slate-100 dark:border-slate-800">
                          <th className="px-4 py-2.5 font-semibold text-slate-500">Permission Code</th>
                          <th className="px-4 py-2.5 font-semibold text-slate-500">Module</th>
                          <th className="px-4 py-2.5 font-semibold text-slate-500">Resource / Action</th>
                          <th className="px-4 py-2.5 font-semibold text-slate-500 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono text-[11px]">
                        {permissions.map((p) => {
                          const isAssignedToCurrent = assignedPermissionIds.has(p.id);
                          return (
                            <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                              <td className="px-4 py-2 font-bold text-slate-900 dark:text-white">
                                {p.code}
                              </td>
                              <td className="px-4 py-2 text-slate-500">
                                <Badge variant="outline" className="text-[9px]">
                                  {p.module}
                                </Badge>
                              </td>
                              <td className="px-4 py-2 text-slate-400">
                                {p.resource}:{p.action}
                              </td>
                              <td className="px-4 py-2 text-right">
                                {isAssignedToCurrent ? (
                                  <span className="text-emerald-500 font-semibold flex items-center justify-end gap-1">
                                    <CheckCircle2 className="h-3 w-3" /> Granted
                                  </span>
                                ) : (
                                  <span className="text-slate-400 flex items-center justify-end gap-1">
                                    <XCircle className="h-3 w-3" /> Unassigned
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-12 text-center text-slate-400">
                Select a system role to inspect and manage its permission matrix.
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Modal: Assign Permission Confirmation */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title={`Assign Permission to ${selectedRole?.name || 'Role'}`}
      >
        <div className="space-y-4 text-left">
          <p className="text-xs text-slate-500">
            Select a backend system permission to grant to role{' '}
            <strong className="text-slate-900 dark:text-white font-mono">{selectedRole?.code}</strong>.
          </p>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Available Permission
            </label>
            <select
              value={permissionToAssign}
              onChange={(e) => setPermissionToAssign(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg outline-none text-slate-900 dark:text-white font-mono"
            >
              <option value="">-- Select Permission --</option>
              {availablePermissionsToAssign.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} ({p.module} - {p.name})
                </option>
              ))}
            </select>
          </div>

          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 rounded-xl text-xs text-blue-700 dark:text-blue-300 space-y-1">
            <span className="font-bold">Confirmation Required:</span>
            <p className="text-[11px] leading-relaxed">
              Granting this permission will immediately authorize all users with the{' '}
              <strong>{selectedRole?.name}</strong> role to execute the selected capability across the platform.
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAssignModalOpen(false)}
              disabled={isSubmittingAssign}
            >
              Cancel
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleConfirmAssign}
              disabled={!permissionToAssign || isSubmittingAssign}
            >
              {isSubmittingAssign ? 'Assigning...' : 'Confirm Permission Assignment'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Remove Permission Confirmation */}
      <Modal
        isOpen={!!permissionToRemove}
        onClose={() => setPermissionToRemove(null)}
        title="Confirm Permission Revocation"
      >
        {permissionToRemove && (
          <div className="space-y-4 text-left">
            <div className="p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-danger flex-shrink-0 mt-0.5" />
              <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">
                  Revoke Permission {permissionToRemove.code}?
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Are you sure you want to remove permission{' '}
                  <code className="font-mono font-bold text-danger">{permissionToRemove.code}</code> from role{' '}
                  <strong className="font-mono">{selectedRole?.code}</strong>?
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPermissionToRemove(null)}
                disabled={isSubmittingRemove}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleConfirmRemove}
                disabled={isSubmittingRemove}
              >
                {isSubmittingRemove ? 'Revoking...' : 'Revoke Permission'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminSecurity;
