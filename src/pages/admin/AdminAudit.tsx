import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';
import { auditApi } from '../../api/audit.api';
import type { AuditLog, FindAuditLogsQuery } from '../../types/audit';
import { ApiError } from '../../types/api';
import {
  Terminal,
  Search,
  RefreshCw,
  Eye,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
  Shield,
  Clock,
  User,
  Globe,
} from 'lucide-react';


export const AdminAudit: React.FC = () => {
  const { showToast } = useToast();

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [pageSize] = useState<number>(10);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [moduleFilter, setModuleFilter] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);


  // Search debounce (400ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchAuditLogs = useCallback(
    async (silent = false) => {
      if (silent) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setLoadError(null);

      try {
        const queryParams: FindAuditLogsQuery = {
          page: currentPage,
          limit: pageSize,
          search: debouncedSearch || undefined,
          module: moduleFilter || undefined,
          severity: severityFilter || undefined,
          sortField: 'createdAt',
          sortOrder: 'desc',
        };

        const res = await auditApi.getAuditLogs(queryParams);
        const data = res.data;

        setLogs(data?.items || []);
        setTotalCount(data?.total ?? data?.items?.length ?? 0);
        setTotalPages(data?.pages ?? Math.ceil((data?.total ?? 1) / pageSize) ?? 1);
      } catch (err: unknown) {
        const message = ApiError.isApiError(err)
          ? err.message
          : err instanceof Error
          ? err.message
          : 'Failed to fetch audit logs from server.';
        setLoadError(message);
        showToast(message, 'error');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [currentPage, pageSize, debouncedSearch, moduleFilter, severityFilter, showToast]
  );

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  const handleOpenDetail = async (log: AuditLog) => {
    setSelectedLog(log);
    try {
      const res = await auditApi.getAuditLogById(log.id);
      if (res.data) {
        setSelectedLog(res.data);
      }
    } catch {
      // Keep summary object if detail fetch fails
    }
  };


  const severityBadgeVariant = (severity: string) => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL':
      case 'HIGH':
        return 'danger';
      case 'MEDIUM':
        return 'warning';
      case 'LOW':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const statusBadgeVariant = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'SUCCESS':
      case 'OK':
        return 'success';
      case 'DENIED':
      case 'FAILED':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const formatJson = (data: unknown): string => {
    if (!data) return 'None';
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">System Audit Logs</h1>
            <Badge variant="secondary" className="font-mono text-xs">
              {totalCount} Log Records
            </Badge>
          </div>
          <p className="text-sm text-slate-500">
            Immutable audit trails, administrative event history, security violations, and payload mutations.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchAuditLogs(true)}
          disabled={isLoading || isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by action, module, or user email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg outline-none text-slate-900 dark:text-white focus:border-secondary transition-colors"
            />
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Module Filter */}
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Filter className="h-3.5 w-3.5" />
              <span>Module:</span>
              <select
                value={moduleFilter}
                onChange={(e) => {
                  setModuleFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white outline-none cursor-pointer"
              >
                <option value="">All Modules</option>
                <option value="AUTH">AUTH</option>
                <option value="USER">USER</option>
                <option value="ROLE">ROLE</option>
                <option value="SYSTEM">SYSTEM</option>
                <option value="PROJECT">PROJECT</option>
                <option value="TASK">TASK</option>
              </select>
            </div>

            {/* Severity Filter */}
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span>Severity:</span>
              <select
                value={severityFilter}
                onChange={(e) => {
                  setSeverityFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white outline-none cursor-pointer"
              >
                <option value="">All Severities</option>
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Table Card */}
      <Card className="p-0 overflow-hidden">
        {/* Error State */}
        {loadError && (
          <div className="p-6 text-center space-y-3 bg-red-50/50 dark:bg-red-950/20">
            <AlertCircle className="h-8 w-8 text-danger mx-auto" />
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                Unable to load audit logs
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">{loadError}</p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => fetchAuditLogs(false)}>
              Retry Request
            </Button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && !loadError && (
          <div className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-4">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        )}

        {/* Table Body */}
        {!isLoading && !loadError && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-dark/40 border-b border-slate-100 dark:border-slate-800">
                    <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Timestamp
                    </th>
                    <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Actor (User)
                    </th>
                    <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Module & Action
                    </th>
                    <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      IP Address
                    </th>
                    <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Severity
                    </th>
                    <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Status
                    </th>
                    <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {logs.length > 0 ? (
                    logs.map((log) => (
                      <tr
                        key={log.id}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors"
                      >
                        <td className="px-6 py-4 text-xs font-mono text-slate-500 dark:text-slate-400">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-slate-900 dark:text-white">
                              {log.user?.displayName || log.user?.email || (log.userId ? log.userId.substring(0, 8) : 'System / Guest')}
                            </span>
                            {log.user?.email && (
                              <span className="text-[10px] text-slate-400 font-mono">
                                {log.user.email}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[9px] font-mono uppercase">
                              {log.module}
                            </Badge>
                            <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                              {log.action}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-mono text-slate-500 dark:text-slate-400">
                          {log.ipAddress || '—'}
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={severityBadgeVariant(log.severity)} className="text-[10px]">
                            {log.severity || 'LOW'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={statusBadgeVariant(log.status)} className="text-[10px]">
                            {log.status || 'SUCCESS'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDetail(log)}
                            className="p-1.5"
                            aria-label="Inspect Audit Record"
                          >
                            <Eye className="h-4 w-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center space-y-2">
                        <Terminal className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-600" />
                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                          No audit logs found
                        </p>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto">
                          No administrative events match your search query or filter parameters.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-dark/20">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Showing page {currentPage} of {totalPages} ({totalCount} total events)
                </span>
                <div className="flex items-center space-x-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Audit Log Details Modal */}
      <Modal
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title="Audit Event Details"
      >
        {selectedLog && (
          <div className="space-y-4 text-left text-sm max-h-[70vh] overflow-y-auto pr-1">
            {/* Header badges */}
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono text-xs">
                  {selectedLog.module}
                </Badge>
                <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                  {selectedLog.action}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Badge variant={severityBadgeVariant(selectedLog.severity)}>
                  {selectedLog.severity}
                </Badge>
                <Badge variant={statusBadgeVariant(selectedLog.status)}>
                  {selectedLog.status}
                </Badge>
              </div>
            </div>

            {/* Event Metadata Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-2.5 bg-slate-50 dark:bg-dark rounded-lg border border-slate-200/60 dark:border-slate-800 space-y-1">
                <div className="flex items-center gap-1 text-slate-400 text-[10px] uppercase font-sans">
                  <Clock className="h-3 w-3" /> Timestamp
                </div>
                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                  {new Date(selectedLog.createdAt).toLocaleString()}
                </span>
              </div>

              <div className="p-2.5 bg-slate-50 dark:bg-dark rounded-lg border border-slate-200/60 dark:border-slate-800 space-y-1">
                <div className="flex items-center gap-1 text-slate-400 text-[10px] uppercase font-sans">
                  <Globe className="h-3 w-3" /> IP Address
                </div>
                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                  {selectedLog.ipAddress || '—'}
                </span>
              </div>

              <div className="p-2.5 bg-slate-50 dark:bg-dark rounded-lg border border-slate-200/60 dark:border-slate-800 space-y-1">
                <div className="flex items-center gap-1 text-slate-400 text-[10px] uppercase font-sans">
                  <User className="h-3 w-3" /> Actor Email
                </div>
                <span className="font-bold text-slate-800 dark:text-slate-200 block truncate">
                  {selectedLog.user?.email || selectedLog.userId || 'System / Anonymous'}
                </span>
              </div>

              <div className="p-2.5 bg-slate-50 dark:bg-dark rounded-lg border border-slate-200/60 dark:border-slate-800 space-y-1">
                <div className="flex items-center gap-1 text-slate-400 text-[10px] uppercase font-sans">
                  <Shield className="h-3 w-3" /> Target Resource
                </div>
                <span className="font-bold text-slate-800 dark:text-slate-200 block truncate">
                  {selectedLog.resourceName || selectedLog.entityType || '—'}
                </span>
              </div>
            </div>

            {/* User Agent */}
            {selectedLog.userAgent && (
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block font-sans">
                  User Agent Client
                </label>
                <div className="p-2 bg-slate-50 dark:bg-dark border border-slate-200/60 dark:border-slate-800 rounded text-[11px] font-mono text-slate-600 dark:text-slate-400 break-all">
                  {selectedLog.userAgent}
                </div>
              </div>
            )}

            {/* Payload Diffs / Metadata JSON Block */}
            {Boolean(selectedLog.metadata || selectedLog.oldValues || selectedLog.newValues) && (
              <div className="space-y-3 border-t border-slate-100 dark:border-slate-800 pt-3">
                {Boolean(selectedLog.metadata) && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block font-sans">
                      Event Metadata
                    </label>
                    <pre className="p-3 bg-slate-900 text-slate-200 rounded-lg text-xs font-mono overflow-x-auto">
                      {formatJson(selectedLog.metadata)}
                    </pre>
                  </div>
                )}

                {Boolean(selectedLog.oldValues) && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-amber-500 uppercase tracking-wider block font-sans">
                      Previous State (Old Values)
                    </label>
                    <pre className="p-3 bg-slate-900 text-amber-300 rounded-lg text-xs font-mono overflow-x-auto">
                      {formatJson(selectedLog.oldValues)}
                    </pre>
                  </div>
                )}

                {Boolean(selectedLog.newValues) && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-green-500 uppercase tracking-wider block font-sans">
                      Updated State (New Values)
                    </label>
                    <pre className="p-3 bg-slate-900 text-green-300 rounded-lg text-xs font-mono overflow-x-auto">
                      {formatJson(selectedLog.newValues)}
                    </pre>
                  </div>
                )}
              </div>
            )}

          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminAudit;
