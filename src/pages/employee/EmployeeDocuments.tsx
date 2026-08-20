import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { TextArea } from '../../components/ui/TextArea';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';
import { documentsApi } from '../../api/documents.api';
import type { DocumentSummary, FindDocumentsQuery } from '../../types/document';
import { ApiError } from '../../types/api';
import {
  FileText,
  Search,
  RefreshCw,
  Upload,
  Download,
  AlertCircle,
  FileCode,
  FileSpreadsheet,
  FileCheck,
  ChevronLeft,
  ChevronRight,
  Plus,
} from 'lucide-react';


export const EmployeeDocuments: React.FC = () => {
  const { showToast } = useToast();

  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [pageSize] = useState<number>(10);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [uploadTitle, setUploadTitle] = useState<string>('');
  const [uploadDescription, setUploadDescription] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

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
          sortField: 'createdAt',
          sortOrder: 'desc',
        };

        const res = await documentsApi.listDocuments(queryParams);
        const data = res.data;

        setDocuments(data?.items || []);
        setTotalCount(data?.total ?? data?.items?.length ?? 0);
        setTotalPages(data?.pages ?? Math.ceil((data?.total ?? 1) / pageSize) ?? 1);
      } catch (err: unknown) {
        const message = ApiError.isApiError(err)
          ? err.message
          : err instanceof Error
          ? err.message
          : 'Failed to fetch documents repository.';
        setLoadError(message);
        showToast(message, 'error');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [currentPage, pageSize, debouncedSearch, showToast]
  );

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !uploadTitle.trim()) {
      showToast('Please specify a title and select a valid file to upload.', 'error');
      return;
    }

    setIsUploading(true);
    try {
      await documentsApi.uploadDocument({
        file: selectedFile,
        title: uploadTitle.trim(),
        description: uploadDescription.trim() || undefined,
      });

      showToast('Document successfully uploaded to repository.', 'success');
      setIsUploadModalOpen(false);
      setUploadTitle('');
      setUploadDescription('');
      setSelectedFile(null);
      await fetchDocuments(true);
    } catch (err: unknown) {
      const message = ApiError.isApiError(err)
        ? err.message
        : err instanceof Error
        ? err.message
        : 'Failed to upload document.';
      showToast(message, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = (mimeType?: string) => {
    if (!mimeType) return <FileText className="h-5 w-5 text-secondary" />;
    if (mimeType.includes('pdf')) return <FileText className="h-5 w-5 text-red-500" />;
    if (mimeType.includes('csv') || mimeType.includes('sheet'))
      return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
    if (mimeType.includes('json') || mimeType.includes('sql'))
      return <FileCode className="h-5 w-5 text-indigo-500" />;
    return <FileCheck className="h-5 w-5 text-secondary" />;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Technical Documents Repository</h1>
            <Badge variant="secondary" className="font-mono text-xs">
              {totalCount} Documents
            </Badge>
          </div>
          <p className="text-sm text-slate-500">
            Architecture blueprints, compliance sheets, deliverables, and API specifications.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchDocuments(true)}
            disabled={isLoading || isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsUploadModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Upload Document
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search document title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg outline-none text-slate-900 dark:text-white focus:border-secondary transition-colors"
          />
        </div>
      </Card>

      {/* Main Table Card */}
      <Card className="p-0 overflow-hidden">
        {loadError && (
          <div className="p-6 text-center space-y-3 bg-red-50/50 dark:bg-red-950/20">
            <AlertCircle className="h-8 w-8 text-danger mx-auto" />
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                Unable to load documents
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">{loadError}</p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => fetchDocuments(false)}>
              Retry Request
            </Button>
          </div>
        )}

        {isLoading && !loadError && (
          <div className="p-6 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-4">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && !loadError && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-dark/40 border-b border-slate-100 dark:border-slate-800">
                    <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Document Title
                    </th>
                    <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      File Format
                    </th>
                    <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Size
                    </th>
                    <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Created Date
                    </th>
                    <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {documents.length > 0 ? (
                    documents.map((doc) => (
                      <tr
                        key={doc.id}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                              {getFileIcon(doc.mimeType)}
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                                {doc.title}
                              </h4>
                              {doc.fileName && (
                                <p className="text-xs text-slate-400 truncate max-w-sm font-mono text-[11px]">
                                  {doc.fileName}
                                </p>
                              )}
                            </div>

                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="outline" className="text-[10px] font-mono">
                            {doc.mimeType ? doc.mimeType.split('/')[1]?.toUpperCase() || 'FILE' : 'FILE'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-xs font-mono text-slate-500 dark:text-slate-400">
                          {formatFileSize(doc.fileSize)}
                        </td>
                        <td className="px-6 py-4 text-xs font-mono text-slate-500 dark:text-slate-400">
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {doc.fileUrl ? (
                            <a
                              href={doc.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center text-xs font-semibold text-secondary hover:underline"
                            >
                              <Download className="h-4 w-4 mr-1" /> Download
                            </a>
                          ) : (
                            <span className="text-xs text-slate-400 font-mono">Stored</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center space-y-2">
                        <FileText className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-600" />
                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                          No documents found in repository
                        </p>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto">
                          Upload architecture diagrams, schemas, or delivery specifications using the button above.
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
                  Showing page {currentPage} of {totalPages} ({totalCount} total items)
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

      {/* Document Upload Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Document"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4 text-left">
          <Input
            label="Document Title"
            value={uploadTitle}
            onChange={(e) => setUploadTitle(e.target.value)}
            placeholder="e.g. AWS Direct Connect Architecture Blueprint"
            required
            disabled={isUploading}
          />

          <TextArea
            label="Description / Context (Optional)"
            value={uploadDescription}
            onChange={(e) => setUploadDescription(e.target.value)}
            placeholder="Specify technical scope or project deliverable relation..."
            disabled={isUploading}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
              File Attachment (PDF, DOCX, XLSX, JSON, CSV - Max 25MB)
            </label>
            <input
              type="file"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              required
              disabled={isUploading}
              className="w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-secondary/10 file:text-secondary hover:file:bg-secondary/20 cursor-pointer"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsUploadModalOpen(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="secondary" size="sm" disabled={isUploading}>
              <Upload className="h-4 w-4 mr-1.5" />
              {isUploading ? 'Uploading Document...' : 'Upload Document'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EmployeeDocuments;
