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
import { clientsApi } from '../../api/clients.api';
import { projectsApi } from '../../api/projects.api';
import type { DocumentSummary, FindDocumentsQuery } from '../../types/document';
import type { ClientSummary } from '../../types/client';
import type { ProjectSummary } from '../../types/project';
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
  Archive,
  RotateCcw,
  Pencil,
  Building,
  FolderKanban,
  Filter,
} from 'lucide-react';

export const EmployeeDocuments: React.FC = () => {
  const { showToast } = useToast();

  // Document list & pagination state
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [pageSize] = useState<number>(10);

  // Filters state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [selectedMimeType, setSelectedMimeType] = useState<string>('');
  const [showArchived, setShowArchived] = useState<boolean>(false);

  // Loading state
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Client & Project selector options
  const [clients, setClients] = useState<ClientSummary[]>([]);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);

  // Action loading states
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  // Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [uploadTitle, setUploadTitle] = useState<string>('');
  const [uploadDescription, setUploadDescription] = useState<string>('');
  const [uploadClientId, setUploadClientId] = useState<string>('');
  const [uploadProjectId, setUploadProjectId] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Edit Modal State
  const [editingDoc, setEditingDoc] = useState<DocumentSummary | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editDescription, setEditDescription] = useState<string>('');
  const [editClientId, setEditClientId] = useState<string>('');
  const [editProjectId, setEditProjectId] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isLoadingEditDetail, setIsLoadingEditDetail] = useState<boolean>(false);

  // Archive Confirm Modal State
  const [archivingDoc, setArchivingDoc] = useState<DocumentSummary | null>(null);
  const [isArchiving, setIsArchiving] = useState<boolean>(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load Client and Project dropdown options
  const fetchClientsAndProjects = useCallback(async () => {
    try {
      const clientRes = await clientsApi.listClients({ limit: 100 });
      setClients(clientRes.data?.items || []);
    } catch {
      setClients([]);
    }
    try {
      const projectRes = await projectsApi.listProjects({ limit: 100 });
      setProjects(projectRes.data?.items || []);
    } catch {
      setProjects([]);
    }
  }, []);

  useEffect(() => {
    fetchClientsAndProjects();
  }, [fetchClientsAndProjects]);

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
          mimeType: selectedMimeType || undefined,
          includeDeleted: showArchived ? true : undefined,
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
    [currentPage, pageSize, debouncedSearch, selectedMimeType, showArchived, showToast]
  );

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Authenticated Document Download Handler
  const handleDownload = async (doc: DocumentSummary) => {
    setDownloadingId(doc.id);
    try {
      showToast(`Initiating download for "${doc.title}"...`, 'info');
      await documentsApi.downloadDocument(doc.id, doc.fileName);
      showToast(`Document "${doc.fileName || doc.title}" downloaded successfully.`, 'success');
    } catch (err: unknown) {
      const message = ApiError.isApiError(err)
        ? err.message
        : err instanceof Error
        ? err.message
        : 'Failed to download document file.';
      showToast(message, 'error');
    } finally {
      setDownloadingId(null);
    }
  };

  // Upload Document Handler
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
        clientId: uploadClientId || undefined,
        projectId: uploadProjectId || undefined,
      });

      showToast('Document successfully uploaded to repository.', 'success');
      setIsUploadModalOpen(false);
      setUploadTitle('');
      setUploadDescription('');
      setUploadClientId('');
      setUploadProjectId('');
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

  // Open Edit Modal Handler
  const handleOpenEdit = async (doc: DocumentSummary) => {
    setEditingDoc(doc);
    setEditTitle(doc.title);
    setEditClientId(doc.clientId || '');
    setEditProjectId(doc.projectId || '');
    setEditDescription('');
    setIsLoadingEditDetail(true);

    try {
      const res = await documentsApi.getDocumentById(doc.id);
      if (res.data) {
        setEditDescription(res.data.description || '');
      }
    } catch {
      // Fallback if detail fetch fails
      setEditDescription('');
    } finally {
      setIsLoadingEditDetail(false);
    }
  };

  // Submit Edit Document Handler
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoc || !editTitle.trim()) {
      showToast('Document title is required.', 'error');
      return;
    }

    setIsUpdating(true);
    try {
      await documentsApi.updateDocument(editingDoc.id, {
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
        clientId: editClientId || null,
        projectId: editProjectId || null,
      });

      showToast('Document metadata successfully updated.', 'success');
      setEditingDoc(null);
      await fetchDocuments(true);
    } catch (err: unknown) {
      const message = ApiError.isApiError(err)
        ? err.message
        : err instanceof Error
        ? err.message
        : 'Failed to update document metadata.';
      showToast(message, 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  // Archive Confirmation Handler
  const handleArchiveConfirm = async () => {
    if (!archivingDoc) return;

    setIsArchiving(true);
    try {
      await documentsApi.archiveDocument(archivingDoc.id);
      showToast(`Document "${archivingDoc.title}" archived successfully.`, 'success');
      setArchivingDoc(null);
      await fetchDocuments(true);
    } catch (err: unknown) {
      const message = ApiError.isApiError(err)
        ? err.message
        : err instanceof Error
        ? err.message
        : 'Failed to archive document.';
      showToast(message, 'error');
    } finally {
      setIsArchiving(false);
    }
  };

  // Restore Document Handler
  const handleRestore = async (doc: DocumentSummary) => {
    setRestoringId(doc.id);
    try {
      await documentsApi.restoreDocument(doc.id);
      showToast(`Document "${doc.title}" restored successfully.`, 'success');
      await fetchDocuments(true);
    } catch (err: unknown) {
      const message = ApiError.isApiError(err)
        ? err.message
        : err instanceof Error
        ? err.message
        : 'Failed to restore document.';
      showToast(message, 'error');
    } finally {
      setRestoringId(null);
    }
  };

  const getFileIcon = (mimeType?: string) => {
    if (!mimeType) return <FileText className="h-5 w-5 text-secondary" />;
    if (mimeType.includes('pdf')) return <FileText className="h-5 w-5 text-red-500" />;
    if (mimeType.includes('csv') || mimeType.includes('sheet') || mimeType.includes('excel'))
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

  const getClientName = (clientId: string | null) => {
    if (!clientId) return null;
    const found = clients.find((c) => c.id === clientId);
    return found ? found.name : null;
  };

  const getProjectName = (projectId: string | null) => {
    if (!projectId) return null;
    const found = projects.find((p) => p.id === projectId);
    return found ? found.name : null;
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
            {showArchived && (
              <Badge variant="outline" className="text-xs text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/20">
                Archived Included
              </Badge>
            )}
          </div>
          <p className="text-sm text-slate-500">
            Architecture blueprints, compliance sheets, deliverables, and API specifications.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={showArchived ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => {
              setShowArchived((prev) => !prev);
              setCurrentPage(1);
            }}
          >
            <Archive className="h-4 w-4 mr-1.5" />
            {showArchived ? 'Showing Archived' : 'Show Archived'}
          </Button>
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search document title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg outline-none text-slate-900 dark:text-white focus:border-secondary transition-colors"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Filter className="h-3.5 w-3.5" />
              <span>File Format:</span>
            </div>
            <select
              value={selectedMimeType}
              onChange={(e) => {
                setSelectedMimeType(e.target.value);
                setCurrentPage(1);
              }}
              className="py-2 px-3 text-xs bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg outline-none text-slate-900 dark:text-white focus:border-secondary transition-colors"
            >
              <option value="">All Formats</option>
              <option value="application/pdf">PDF (.pdf)</option>
              <option value="application/vnd.openxmlformats-officedocument.wordprocessingml.document">
                Word (.docx)
              </option>
              <option value="application/msword">Word Legacy (.doc)</option>
              <option value="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet">
                Excel (.xlsx)
              </option>
              <option value="application/vnd.ms-excel">Excel Legacy (.xls)</option>
              <option value="text/plain">Text (.txt)</option>
              <option value="text/csv">CSV (.csv)</option>
              <option value="image/png">PNG Image (.png)</option>
              <option value="image/jpeg">JPEG Image (.jpg)</option>
              <option value="image/webp">WebP Image (.webp)</option>
              <option value="application/zip">Zip Archive (.zip)</option>
            </select>
          </div>
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
                    documents.map((doc) => {
                      const clientName = getClientName(doc.clientId);
                      const projectName = getProjectName(doc.projectId);

                      return (
                        <tr
                          key={doc.id}
                          className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg shrink-0 mt-0.5">
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
                                {(clientName || projectName) && (
                                  <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                    {clientName && (
                                      <Badge
                                        variant="outline"
                                        className="text-[10px] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
                                      >
                                        <Building className="h-3 w-3 mr-1 text-slate-400" />
                                        {clientName}
                                      </Badge>
                                    )}
                                    {projectName && (
                                      <Badge
                                        variant="outline"
                                        className="text-[10px] text-secondary border-secondary/30 bg-secondary/5"
                                      >
                                        <FolderKanban className="h-3 w-3 mr-1" />
                                        {projectName}
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="outline" className="text-[10px] font-mono">
                              {doc.mimeType
                                ? doc.mimeType.split('/')[1]?.toUpperCase() || 'FILE'
                                : 'FILE'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-xs font-mono text-slate-500 dark:text-slate-400">
                            {formatFileSize(doc.fileSize)}
                          </td>
                          <td className="px-6 py-4 text-xs font-mono text-slate-500 dark:text-slate-400">
                            {new Date(doc.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownload(doc)}
                                disabled={downloadingId === doc.id}
                                className="h-8 text-xs px-2.5"
                                title="Download Document File"
                              >
                                {downloadingId === doc.id ? (
                                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Download className="h-3.5 w-3.5 text-secondary" />
                                )}
                                <span className="ml-1 hidden sm:inline">
                                  {downloadingId === doc.id ? 'Downloading...' : 'Download'}
                                </span>
                              </Button>

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenEdit(doc)}
                                className="h-8 w-8 p-0"
                                title="Edit Document Metadata"
                              >
                                <Pencil className="h-3.5 w-3.5 text-slate-500" />
                              </Button>

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setArchivingDoc(doc)}
                                className="h-8 w-8 p-0 hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-950/20"
                                title="Archive Document"
                              >
                                <Archive className="h-3.5 w-3.5 text-red-500" />
                              </Button>

                              {showArchived && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRestore(doc)}
                                  disabled={restoringId === doc.id}
                                  className="h-8 text-xs px-2 hover:border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                                  title="Restore Document"
                                >
                                  {restoringId === doc.id ? (
                                    <RefreshCw className="h-3.5 w-3.5 animate-spin text-emerald-600" />
                                  ) : (
                                    <RotateCcw className="h-3.5 w-3.5 text-emerald-600" />
                                  )}
                                  <span className="ml-1 text-emerald-600 hidden sm:inline">Restore</span>
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center space-y-2">
                        <FileText className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-600" />
                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                          No documents found in repository
                        </p>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto">
                          {showArchived
                            ? 'No archived documents matched your search criteria.'
                            : 'Upload architecture diagrams, schemas, or delivery specifications using the button above.'}
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

          {/* Client Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
              Associated Client Account (Optional)
            </label>
            <select
              value={uploadClientId}
              onChange={(e) => setUploadClientId(e.target.value)}
              disabled={isUploading}
              className="w-full text-xs p-2.5 bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg outline-none text-slate-900 dark:text-white focus:border-secondary transition-colors"
            >
              <option value="">No Client Linked</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name} ({client.code})
                </option>
              ))}
            </select>
          </div>

          {/* Project Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
              Associated Project (Optional)
            </label>
            <select
              value={uploadProjectId}
              onChange={(e) => setUploadProjectId(e.target.value)}
              disabled={isUploading}
              className="w-full text-xs p-2.5 bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg outline-none text-slate-900 dark:text-white focus:border-secondary transition-colors"
            >
              <option value="">No Project Linked</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name} ({project.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
              File Attachment (PDF, DOCX, XLSX, JSON, CSV - Max 25MB)
            </label>
            <input
              type="file"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              required
              disabled={isUploading}
              accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain,text/csv,image/jpeg,image/png,image/webp,application/zip"
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

      {/* Edit Document Metadata Modal */}
      <Modal
        isOpen={!!editingDoc}
        onClose={() => setEditingDoc(null)}
        title="Edit Document Metadata"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4 text-left">
          {isLoadingEditDetail ? (
            <div className="space-y-3 py-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : (
            <>
              <Input
                label="Document Title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Enter document title"
                required
                disabled={isUpdating}
              />

              <TextArea
                label="Description / Context (Optional)"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Specify technical scope or project deliverable relation..."
                disabled={isUpdating}
              />

              {/* Client Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                  Associated Client Account
                </label>
                <select
                  value={editClientId}
                  onChange={(e) => setEditClientId(e.target.value)}
                  disabled={isUpdating}
                  className="w-full text-xs p-2.5 bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg outline-none text-slate-900 dark:text-white focus:border-secondary transition-colors"
                >
                  <option value="">No Client Linked</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name} ({client.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Project Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                  Associated Project
                </label>
                <select
                  value={editProjectId}
                  onChange={(e) => setEditProjectId(e.target.value)}
                  disabled={isUpdating}
                  className="w-full text-xs p-2.5 bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg outline-none text-slate-900 dark:text-white focus:border-secondary transition-colors"
                >
                  <option value="">No Project Linked</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name} ({project.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingDoc(null)}
                  disabled={isUpdating}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="secondary" size="sm" disabled={isUpdating}>
                  {isUpdating ? 'Saving Changes...' : 'Save Changes'}
                </Button>
              </div>
            </>
          )}
        </form>
      </Modal>

      {/* Archive Confirmation Modal */}
      <Modal
        isOpen={!!archivingDoc}
        onClose={() => setArchivingDoc(null)}
        title="Archive Document"
      >
        <div className="space-y-4 text-left">
          <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300 rounded-lg border border-red-200 dark:border-red-800">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-red-500" />
            <div className="text-xs space-y-1">
              <h5 className="font-semibold text-sm">Confirm Document Archival</h5>
              <p>
                Are you sure you want to archive document{' '}
                <span className="font-semibold">{archivingDoc?.title}</span>?
              </p>
              <p className="text-slate-500 dark:text-slate-400">
                The document record will be soft-deleted. You can view or restore archived documents anytime using the "Show Archived" filter.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setArchivingDoc(null)}
              disabled={isArchiving}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={handleArchiveConfirm}
              disabled={isArchiving}
            >
              {isArchiving ? 'Archiving...' : 'Archive Document'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EmployeeDocuments;
