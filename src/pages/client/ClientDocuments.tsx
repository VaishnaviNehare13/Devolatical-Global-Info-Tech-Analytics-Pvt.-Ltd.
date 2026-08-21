import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { DataTable } from '../../components/ui/DataTable';
import { Skeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';
import { documentsApi } from '../../api/documents.api';
import type { DocumentSummary, FindDocumentsQuery } from '../../types/document';
import { ApiError } from '../../types/api';
import {
  FileText,
  Download,
  Search,
  RefreshCw,
  AlertCircle,
  FileCode,
  FileSpreadsheet,
  FileCheck,
  HardDrive,
  Clock,
  Layers,
  CheckCircle2,
} from 'lucide-react';

export const ClientDocuments: React.FC = () => {
  const { showToast } = useToast();

  // Data States
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [totalDocuments, setTotalDocuments] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);

  // Filter States
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [mimeFilter, setMimeFilter] = useState<string>('ALL');

  // Loading States
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Search Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch Documents
  const fetchDocuments = useCallback(
    async (silent = false) => {
      if (silent) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setLoadError(null);

      try {
        const queryParams: FindDocumentsQuery = {
          page: currentPage,
          limit: pageSize,
          search: debouncedSearch || undefined,
          mimeType: mimeFilter !== 'ALL' ? mimeFilter : undefined,
          sortField: 'createdAt',
          sortOrder: 'desc',
        };

        const res = await documentsApi.listDocuments(queryParams);
        const data = res.data;

        setDocuments(data?.items || []);
        setTotalDocuments(data?.total ?? data?.items?.length ?? 0);
      } catch (err: unknown) {
        const msg = ApiError.isApiError(err) ? err.message : 'Failed to load document vault.';
        setLoadError(msg);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [currentPage, pageSize, debouncedSearch, mimeFilter]
  );

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Handle Secure Document Download
  const handleDownload = async (doc: DocumentSummary) => {
    setDownloadingId(doc.id);
    try {
      await documentsApi.downloadDocument(doc.id, doc.fileName || doc.title);
      showToast(`Started download for "${doc.title}".`, 'success');
    } catch (err: unknown) {
      const msg = ApiError.isApiError(err) ? err.message : 'Failed to download document file.';
      showToast(msg, 'error');
    } finally {
      setDownloadingId(null);
    }
  };

  // Helper formatting routines
  const formatBytes = (bytes: number): string => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType?.includes('pdf')) return <FileText className="h-4 w-4 text-red-500 flex-shrink-0" />;
    if (mimeType?.includes('sheet') || mimeType?.includes('excel') || mimeType?.includes('csv'))
      return <FileSpreadsheet className="h-4 w-4 text-emerald-500 flex-shrink-0" />;
    if (mimeType?.includes('json') || mimeType?.includes('code'))
      return <FileCode className="h-4 w-4 text-amber-500 flex-shrink-0" />;
    return <FileCheck className="h-4 w-4 text-secondary flex-shrink-0" />;
  };

  // Calculated Stats
  const totalSizeBytes = documents.reduce((acc, d) => acc + (d.fileSize || 0), 0);
  const pdfCount = documents.filter((d) => d.mimeType?.includes('pdf')).length;

  // Table Columns Definition
  const columns = [
    {
      key: 'title' as keyof DocumentSummary,
      header: 'Document Name / Title',
      render: (d: DocumentSummary) => (
        <div className="flex items-start gap-2.5">
          {getFileIcon(d.mimeType)}
          <div className="space-y-0.5">
            <span className="font-bold text-xs text-slate-900 dark:text-white block truncate max-w-[260px]">
              {d.title}
            </span>
            <span className="text-[10px] font-mono text-slate-400 block truncate max-w-[220px]">
              {d.fileName}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'mimeType' as keyof DocumentSummary,
      header: 'File Type',
      render: (d: DocumentSummary) => {
        const ext = d.fileName?.split('.').pop()?.toUpperCase() || 'FILE';
        return <Badge variant="outline" className="font-mono text-[10px] uppercase">{ext}</Badge>;
      },
    },
    {
      key: 'fileSize' as keyof DocumentSummary,
      header: 'File Size',
      render: (d: DocumentSummary) => (
        <span className="font-mono text-xs text-slate-600 dark:text-slate-300">
          {formatBytes(d.fileSize)}
        </span>
      ),
    },
    {
      key: 'createdAt' as keyof DocumentSummary,
      header: 'Uploaded Date',
      render: (d: DocumentSummary) => (
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500">
          <Clock className="h-3 w-3 text-slate-400" />
          <span>{d.createdAt ? new Date(d.createdAt).toLocaleDateString() : 'N/A'}</span>
        </div>
      ),
    },
    {
      key: 'actions' as keyof DocumentSummary,
      header: 'Actions',
      render: (d: DocumentSummary) => (
        <Button
          variant="primary"
          size="sm"
          className="h-7 px-3 text-xs"
          onClick={() => handleDownload(d)}
          disabled={downloadingId === d.id}
        >
          <Download className={`h-3.5 w-3.5 mr-1.5 ${downloadingId === d.id ? 'animate-bounce' : ''}`} />
          {downloadingId === d.id ? 'Downloading...' : 'Download'}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Documents & Vault</h1>
          <p className="text-sm text-slate-500">
            Secure client document repository. Access project specifications, contracts, and deliverable attachments.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => fetchDocuments(true)} disabled={isLoading || isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-mono">
            <span>Total Shared Files</span>
            <FileText className="h-4 w-4 text-secondary" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{totalDocuments}</div>
          <div className="text-[10px] text-slate-400">Accessible files</div>
        </Card>

        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-mono">
            <span>PDF Specifications</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{pdfCount}</div>
          <div className="text-[10px] text-slate-400">PDF contracts & specs</div>
        </Card>

        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-mono">
            <span>Recent Uploads</span>
            <Layers className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{documents.length}</div>
          <div className="text-[10px] text-slate-400">Current page items</div>
        </Card>

        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-mono">
            <span>Total Storage Volume</span>
            <HardDrive className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
            {formatBytes(totalSizeBytes)}
          </div>
          <div className="text-[10px] text-slate-400">Page volume size</div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by document title or filename..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg outline-none text-slate-900 dark:text-white focus:border-secondary transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Filter Type:</span>
            <select
              value={mimeFilter}
              onChange={(e) => {
                setMimeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white outline-none cursor-pointer"
            >
              <option value="ALL">All File Types</option>
              <option value="application/pdf">PDF Documents</option>
              <option value="application/json">JSON Data</option>
              <option value="text/csv">CSV Spreadsheets</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Main Table Content */}
      {loadError && (
        <Card className="p-8 text-center space-y-3 bg-red-50/50 dark:bg-red-950/20">
          <AlertCircle className="h-8 w-8 text-danger mx-auto" />
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Unable to load document vault</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">{loadError}</p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => fetchDocuments(false)}>
            Retry Request
          </Button>
        </Card>
      )}

      {isLoading && !loadError && (
        <Card className="p-6 space-y-4">
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </Card>
      )}

      {!isLoading && !loadError && (
        <Card>
          <CardHeader>
            <CardTitle>Document Vault Directory</CardTitle>
            <CardDescription>Enterprise contracts, architecture specifications, and milestone attachments.</CardDescription>
          </CardHeader>
          <CardContent>
            {documents.length > 0 ? (
              <DataTable columns={columns} data={documents} rowsPerPage={pageSize} />
            ) : (
              <div className="py-12 text-center space-y-2">
                <FileText className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-600" />
                <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300">No documents found</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  No files are currently shared with your organization matching your search or type filter.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ClientDocuments;
