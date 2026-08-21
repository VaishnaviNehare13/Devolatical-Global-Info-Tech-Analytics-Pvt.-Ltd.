import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { TextArea } from '../../components/ui/TextArea';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { DataTable } from '../../components/ui/DataTable';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { useToast } from '../../components/ui/Toast';
import { pipelinesApi } from '../../api/pipelines.api';
import { clientsApi } from '../../api/clients.api';
import { projectsApi } from '../../api/projects.api';
import type {
  DataPipeline,
  PipelineTelemetryMetrics,
  PipelineStatus,
} from '../../types/pipeline';
import { ApiError } from '../../types/api';
import {
  Play,
  Square,
  Database,
  RefreshCw,
  AlertCircle,
  Search,
  Plus,
  Trash2,
  Edit,
  Eye,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Activity,
  Layers,
  X,
} from 'lucide-react';

interface DisplayPipelineRecord {
  id: string;
  rawId: string;
  name: string;
  source: string;
  target: string;
  volume: string;
  progress: number;
  status: PipelineStatus;
  clientName: string;
  projectName: string;
  updatedAt: string;
}

export const AdminPipelines: React.FC = () => {
  const { showToast } = useToast();

  // Telemetry Metrics State
  const [telemetry, setTelemetry] = useState<PipelineTelemetryMetrics | null>(null);
  const [isLoadingTelemetry, setIsLoadingTelemetry] = useState<boolean>(true);

  // Pipelines Directory State
  const [pipelines, setPipelines] = useState<DataPipeline[]>([]);
  const [isLoadingPipelines, setIsLoadingPipelines] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Selected Detail Modal State
  const [selectedPipelineId, setSelectedPipelineId] = useState<string | null>(null);
  const [pipelineDetail, setPipelineDetail] = useState<DataPipeline | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);

  // Create Modal State
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [isSubmittingCreate, setIsSubmittingCreate] = useState<boolean>(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    status: 'ACTIVE' as PipelineStatus,
    source: 'Kafka Ingestion Engine',
    target: 'Snowflake Core DW',
    volume: '1.2M req/hr',
    progress: 0,
    clientId: '',
    projectId: '',
  });

  // Edit Modal State
  const [editingPipeline, setEditingPipeline] = useState<DataPipeline | null>(null);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState<boolean>(false);

  // Status Change Modal State
  const [statusPipeline, setStatusPipeline] = useState<DataPipeline | null>(null);
  const [newStatus, setNewStatus] = useState<PipelineStatus>('ACTIVE');
  const [statusErrorMessage, setStatusErrorMessage] = useState('');
  const [isSubmittingStatus, setIsSubmittingStatus] = useState<boolean>(false);

  // Delete Confirmation State
  const [deletingPipelineId, setDeletingPipelineId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Options for Client & Project Selectors
  const [clients, setClients] = useState<Array<{ id: string; name: string }>>([]);
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>([]);

  // Fetch Telemetry Metrics
  const fetchTelemetry = useCallback(async () => {
    setIsLoadingTelemetry(true);
    try {
      const res = await pipelinesApi.getTelemetryMetrics();
      if (res.data) {
        setTelemetry(res.data);
      }
    } catch {
      // Silently handle telemetry load failure
    } finally {
      setIsLoadingTelemetry(false);
    }
  }, []);

  // Fetch Pipelines Directory
  const fetchPipelines = useCallback(async () => {
    setIsLoadingPipelines(true);
    setError(null);
    try {
      const res = await pipelinesApi.listPipelines({
        search: searchQuery || undefined,
        status: (statusFilter as PipelineStatus) || undefined,
        limit: 100,
      });

      if (res.data) {
        setPipelines(res.data.items || []);
      }
    } catch (err: unknown) {
      const message = ApiError.isApiError(err)
        ? err.message
        : 'Failed to retrieve data pipelines directory.';
      setError(message);
      showToast(message, 'error');
    } finally {
      setIsLoadingPipelines(false);
    }
  }, [searchQuery, statusFilter, showToast]);

  // Fetch Clients & Projects for selector dropdowns
  const fetchOptions = useCallback(async () => {
    try {
      const [clientsRes, projectsRes] = await Promise.allSettled([
        clientsApi.listClients({ limit: 100 }),
        projectsApi.listProjects({ limit: 100 }),
      ]);

      if (clientsRes.status === 'fulfilled' && clientsRes.value?.data?.items) {
        setClients(
          clientsRes.value.data.items.map((c) => ({ id: c.id, name: `${c.name} (${c.code})` }))
        );
      }
      if (projectsRes.status === 'fulfilled' && projectsRes.value?.data?.items) {
        setProjects(
          projectsRes.value.data.items.map((p) => ({ id: p.id, name: `${p.name} (${p.code})` }))
        );
      }
    } catch {
      // Options fallback
    }
  }, []);

  useEffect(() => {
    fetchTelemetry();
    fetchPipelines();
    fetchOptions();
  }, [fetchTelemetry, fetchPipelines, fetchOptions]);

  // Fetch Detail for Modal Inspection
  const fetchPipelineDetail = useCallback(async (id: string) => {
    setIsLoadingDetail(true);
    try {
      const res = await pipelinesApi.getPipelineById(id);
      if (res.data) {
        setPipelineDetail(res.data);
      }
    } catch {
      showToast('Failed to fetch pipeline detail.', 'error');
    } finally {
      setIsLoadingDetail(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (selectedPipelineId) {
      fetchPipelineDetail(selectedPipelineId);
    } else {
      setPipelineDetail(null);
    }
  }, [selectedPipelineId, fetchPipelineDetail]);

  // Handlers for Create Pipeline
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim()) {
      showToast('Pipeline name is required.', 'error');
      return;
    }

    setIsSubmittingCreate(true);
    try {
      await pipelinesApi.createPipeline({
        name: createForm.name.trim(),
        description: createForm.description.trim() || undefined,
        status: createForm.status,
        source: createForm.source.trim() || undefined,
        target: createForm.target.trim() || undefined,
        volume: createForm.volume.trim() || undefined,
        progress: Number(createForm.progress) || 0,
        clientId: createForm.clientId || undefined,
        projectId: createForm.projectId || undefined,
      });

      showToast('Data pipeline specification created successfully.', 'success');
      setShowCreateModal(false);
      setCreateForm({
        name: '',
        description: '',
        status: 'ACTIVE',
        source: 'Kafka Ingestion Engine',
        target: 'Snowflake Core DW',
        volume: '1.2M req/hr',
        progress: 0,
        clientId: '',
        projectId: '',
      });
      fetchPipelines();
      fetchTelemetry();
    } catch (err: unknown) {
      const message = ApiError.isApiError(err) ? err.message : 'Failed to create pipeline.';
      showToast(message, 'error');
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  // Handlers for Edit Pipeline
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPipeline) return;

    setIsSubmittingEdit(true);
    try {
      await pipelinesApi.updatePipeline(editingPipeline.id, {
        name: editingPipeline.name,
        description: editingPipeline.description || undefined,
        source: editingPipeline.source,
        target: editingPipeline.target,
        volume: editingPipeline.volume,
        progress: Number(editingPipeline.progress),
        clientId: editingPipeline.clientId || undefined,
        projectId: editingPipeline.projectId || undefined,
      });

      showToast('Pipeline details updated successfully.', 'success');
      setEditingPipeline(null);
      fetchPipelines();
      fetchTelemetry();
      if (selectedPipelineId === editingPipeline.id) {
        fetchPipelineDetail(editingPipeline.id);
      }
    } catch (err: unknown) {
      const message = ApiError.isApiError(err) ? err.message : 'Failed to update pipeline.';
      showToast(message, 'error');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Handlers for Status Shift
  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusPipeline) return;

    setIsSubmittingStatus(true);
    try {
      await pipelinesApi.updatePipelineStatus(statusPipeline.id, {
        status: newStatus,
        errorMessage: newStatus === 'FAILED' ? statusErrorMessage.trim() || undefined : undefined,
      });

      showToast(`Pipeline status changed to ${newStatus}.`, 'success');
      setStatusPipeline(null);
      fetchPipelines();
      fetchTelemetry();
      if (selectedPipelineId === statusPipeline.id) {
        fetchPipelineDetail(statusPipeline.id);
      }
    } catch (err: unknown) {
      const message = ApiError.isApiError(err) ? err.message : 'Failed to update status.';
      showToast(message, 'error');
    } finally {
      setIsSubmittingStatus(false);
    }
  };

  // Quick Toggle Status (Active <-> Stopped)
  const handleQuickToggleStatus = async (pipeline: DataPipeline) => {
    const next: PipelineStatus = pipeline.status === 'ACTIVE' ? 'STOPPED' : 'ACTIVE';
    try {
      await pipelinesApi.updatePipelineStatus(pipeline.id, { status: next });
      showToast(`Pipeline '${pipeline.name}' shifted to ${next}.`, 'info');
      fetchPipelines();
      fetchTelemetry();
    } catch (err: unknown) {
      const message = ApiError.isApiError(err) ? err.message : 'Status shift failed.';
      showToast(message, 'error');
    }
  };

  // Handlers for Delete / Archive
  const handleDeleteConfirm = async () => {
    if (!deletingPipelineId) return;

    setIsDeleting(true);
    try {
      await pipelinesApi.deletePipeline(deletingPipelineId);
      showToast('Data pipeline archived successfully.', 'info');
      setDeletingPipelineId(null);
      if (selectedPipelineId === deletingPipelineId) {
        setSelectedPipelineId(null);
      }
      fetchPipelines();
      fetchTelemetry();
    } catch (err: unknown) {
      const message = ApiError.isApiError(err) ? err.message : 'Failed to archive pipeline.';
      showToast(message, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Table Data Mapping
  const displayData: DisplayPipelineRecord[] = pipelines.map((pip) => ({
    id: pip.id.slice(0, 8).toUpperCase(),
    rawId: pip.id,
    name: pip.name,
    source: pip.source,
    target: pip.target,
    volume: pip.volume,
    progress: pip.progress,
    status: pip.status,
    clientName: pip.client?.name || 'All Clients',
    projectName: pip.project?.name || 'General DW',
    updatedAt: new Date(pip.updatedAt || pip.createdAt).toLocaleDateString(),
  }));

  const columns = [
    { key: 'id' as keyof DisplayPipelineRecord, header: 'Ref' },
    { key: 'name' as keyof DisplayPipelineRecord, header: 'Pipeline Stream Name' },
    { key: 'source' as keyof DisplayPipelineRecord, header: 'Data Source' },
    { key: 'target' as keyof DisplayPipelineRecord, header: 'Data Target' },
    { key: 'volume' as keyof DisplayPipelineRecord, header: 'Throughput Spec' },
    {
      key: 'progress' as keyof DisplayPipelineRecord,
      header: 'Stream Progress',
      render: (row: DisplayPipelineRecord) => (
        <div className="w-32 space-y-1">
          <div className="flex justify-between text-[10px] font-mono text-slate-400">
            <span>Progress</span>
            <span>{row.progress}%</span>
          </div>
          <ProgressBar value={row.progress} />
        </div>
      ),
    },
    {
      key: 'status' as keyof DisplayPipelineRecord,
      header: 'Status',
      render: (row: DisplayPipelineRecord) => {
        const variants: Record<PipelineStatus, 'success' | 'secondary' | 'outline' | 'danger' | 'warning'> = {
          ACTIVE: 'success',
          SYNCING: 'secondary',
          STOPPED: 'outline',
          COMPLETED: 'success',
          FAILED: 'danger',
        };
        return <Badge variant={variants[row.status] || 'secondary'}>{row.status}</Badge>;
      },
    },
    {
      key: 'rawId' as keyof DisplayPipelineRecord,
      header: 'Actions',
      render: (row: DisplayPipelineRecord) => {
        const rawObj = pipelines.find((p) => p.id === row.rawId);
        return (
          <div className="flex items-center gap-1.5">
            {/* Quick Status Toggle */}
            <button
              onClick={() => rawObj && handleQuickToggleStatus(rawObj)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold cursor-pointer"
              title={row.status === 'ACTIVE' ? 'Stop Stream' : 'Activate Stream'}
            >
              {row.status === 'ACTIVE' ? (
                <Square className="h-3.5 w-3.5 text-red-500" />
              ) : (
                <Play className="h-3.5 w-3.5 text-green-500" />
              )}
            </button>

            {/* Inspect Detail */}
            <button
              onClick={() => setSelectedPipelineId(row.rawId)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold cursor-pointer text-slate-600 dark:text-slate-300"
              title="View Pipeline Details"
            >
              <Eye className="h-3.5 w-3.5" />
            </button>

            {/* Edit */}
            <button
              onClick={() => rawObj && setEditingPipeline(rawObj)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold cursor-pointer text-secondary"
              title="Edit Pipeline Specs"
            >
              <Edit className="h-3.5 w-3.5" />
            </button>

            {/* Change Status Modal Trigger */}
            <button
              onClick={() => {
                if (rawObj) {
                  setStatusPipeline(rawObj);
                  setNewStatus(rawObj.status);
                  setStatusErrorMessage(rawObj.errorMessage || '');
                }
              }}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold cursor-pointer text-amber-500"
              title="Change Status / Log Error"
            >
              <Activity className="h-3.5 w-3.5" />
            </button>

            {/* Archive / Delete */}
            <button
              onClick={() => setDeletingPipelineId(row.rawId)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold cursor-pointer text-red-500"
              title="Archive Pipeline"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 text-left">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Data Pipelines & ETL Hub</h1>
            <Badge variant="secondary" className="font-mono text-xs">
              Live Infrastructure API
            </Badge>
          </div>
          <p className="text-sm text-slate-500">
            Real-time telemetry metrics, streaming specs, and enterprise ETL data targets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            New Data Pipeline
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchPipelines();
              fetchTelemetry();
            }}
            disabled={isLoadingPipelines || isLoadingTelemetry}
          >
            <RefreshCw
              className={`h-4 w-4 mr-1.5 ${
                isLoadingPipelines || isLoadingTelemetry ? 'animate-spin' : ''
              }`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Alert Box */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl flex items-center justify-between text-red-800 dark:text-red-200 text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => { fetchPipelines(); fetchTelemetry(); }}>
            Retry Sync
          </Button>
        </div>
      )}

      {/* Real Live Telemetry Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase font-mono">
            <div className="flex items-center gap-1.5">
              <Database className="h-4 w-4 text-secondary" />
              <span>Total Pipelines</span>
            </div>
          </div>
          {isLoadingTelemetry ? (
            <Skeleton className="h-7 w-20 mt-2" />
          ) : (
            <div className="mt-2">
              <span className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
                {telemetry?.totalPipelines ?? 0}
              </span>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                Avg Progress: {telemetry?.averageProgress ?? 0}%
              </p>
            </div>
          )}
        </Card>

        <Card className="p-4 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase font-mono">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>Active Streams</span>
            </div>
          </div>
          {isLoadingTelemetry ? (
            <Skeleton className="h-7 w-20 mt-2" />
          ) : (
            <div className="mt-2">
              <span className="text-2xl font-bold font-heading text-emerald-600 dark:text-emerald-400">
                {telemetry?.activePipelines ?? 0}
              </span>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                {telemetry?.syncingPipelines ?? 0} Syncing Stream(s)
              </p>
            </div>
          )}
        </Card>

        <Card className="p-4 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase font-mono">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span>Stopped / Paused</span>
            </div>
          </div>
          {isLoadingTelemetry ? (
            <Skeleton className="h-7 w-20 mt-2" />
          ) : (
            <div className="mt-2">
              <span className="text-2xl font-bold font-heading text-amber-600 dark:text-amber-400">
                {telemetry?.stoppedPipelines ?? 0}
              </span>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                {telemetry?.completedPipelines ?? 0} Completed Stream(s)
              </p>
            </div>
          )}
        </Card>

        <Card className="p-4 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase font-mono">
            <div className="flex items-center gap-1.5">
              <XCircle className="h-4 w-4 text-red-500" />
              <span>Failed Streams</span>
            </div>
          </div>
          {isLoadingTelemetry ? (
            <Skeleton className="h-7 w-20 mt-2" />
          ) : (
            <div className="mt-2">
              <span className="text-2xl font-bold font-heading text-red-600 dark:text-red-400">
                {telemetry?.failedPipelines ?? 0}
              </span>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                Requires Engineering Attention
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Filter & Search Controls */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          <div className="sm:col-span-8 relative">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search data pipeline by name, source, target, or specs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white"
            />
          </div>

          <div className="sm:col-span-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white"
            >
              <option value="">All Pipeline Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="SYNCING">SYNCING</option>
              <option value="STOPPED">STOPPED</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="FAILED">FAILED</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Data Pipelines Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 text-secondary">
            <Layers className="h-5 w-5" />
            <CardTitle>Global ETL & Ingestion Pipelines</CardTitle>
          </div>
          <CardDescription>
            Active database data pipelines, streaming protocols, and throughput specifications.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {isLoadingPipelines ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={displayData}
              searchKey="name"
              rowsPerPage={10}
            />
          )}
        </CardContent>
      </Card>

      {/* Modal 1: Create Data Pipeline */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Create Data Pipeline Specification</CardTitle>
                <CardDescription>Register a new ingestion stream or ETL pipeline.</CardDescription>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <Input
                  label="Pipeline Stream Name"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  required
                  disabled={isSubmittingCreate}
                  placeholder="e.g. financial-transactions-kafka-stream"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Data Source Engine"
                    value={createForm.source}
                    onChange={(e) => setCreateForm({ ...createForm, source: e.target.value })}
                    disabled={isSubmittingCreate}
                  />

                  <Input
                    label="Data Target Core DW"
                    value={createForm.target}
                    onChange={(e) => setCreateForm({ ...createForm, target: e.target.value })}
                    disabled={isSubmittingCreate}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="Throughput Spec"
                    value={createForm.volume}
                    onChange={(e) => setCreateForm({ ...createForm, volume: e.target.value })}
                    disabled={isSubmittingCreate}
                    placeholder="1.2M req/hr"
                  />

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                      Initial Status
                    </label>
                    <select
                      value={createForm.status}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, status: e.target.value as PipelineStatus })
                      }
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="SYNCING">SYNCING</option>
                      <option value="STOPPED">STOPPED</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                      Progress (%): {createForm.progress}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={createForm.progress}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, progress: Number(e.target.value) })
                      }
                      className="w-full mt-3"
                    />
                  </div>
                </div>

                {clients.length > 0 && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                      Associated Client (Optional)
                    </label>
                    <select
                      value={createForm.clientId}
                      onChange={(e) => setCreateForm({ ...createForm, clientId: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white"
                    >
                      <option value="">Global / Unassigned Client</option>
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {projects.length > 0 && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                      Associated Project (Optional)
                    </label>
                    <select
                      value={createForm.projectId}
                      onChange={(e) => setCreateForm({ ...createForm, projectId: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white"
                    >
                      <option value="">Global / Unassigned Project</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <TextArea
                  label="Description / Architecture Notes"
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  disabled={isSubmittingCreate}
                />

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateModal(false)}
                    disabled={isSubmittingCreate}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="secondary" disabled={isSubmittingCreate}>
                    {isSubmittingCreate ? 'Creating Pipeline...' : 'Create Pipeline Spec'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal 2: Edit Data Pipeline */}
      {editingPipeline && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Edit Data Pipeline Specs</CardTitle>
                <CardDescription>Update target DW, throughput volume, or progress.</CardDescription>
              </div>
              <button
                onClick={() => setEditingPipeline(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <Input
                  label="Pipeline Stream Name"
                  value={editingPipeline.name}
                  onChange={(e) => setEditingPipeline({ ...editingPipeline, name: e.target.value })}
                  required
                  disabled={isSubmittingEdit}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Data Source Engine"
                    value={editingPipeline.source}
                    onChange={(e) =>
                      setEditingPipeline({ ...editingPipeline, source: e.target.value })
                    }
                    disabled={isSubmittingEdit}
                  />

                  <Input
                    label="Data Target Core DW"
                    value={editingPipeline.target}
                    onChange={(e) =>
                      setEditingPipeline({ ...editingPipeline, target: e.target.value })
                    }
                    disabled={isSubmittingEdit}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Throughput Spec"
                    value={editingPipeline.volume}
                    onChange={(e) =>
                      setEditingPipeline({ ...editingPipeline, volume: e.target.value })
                    }
                    disabled={isSubmittingEdit}
                  />

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                      Stream Progress: {editingPipeline.progress}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={editingPipeline.progress}
                      onChange={(e) =>
                        setEditingPipeline({
                          ...editingPipeline,
                          progress: Number(e.target.value),
                        })
                      }
                      className="w-full mt-3"
                    />
                  </div>
                </div>

                <TextArea
                  label="Description / Architecture Notes"
                  value={editingPipeline.description || ''}
                  onChange={(e) =>
                    setEditingPipeline({ ...editingPipeline, description: e.target.value })
                  }
                  disabled={isSubmittingEdit}
                />

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingPipeline(null)}
                    disabled={isSubmittingEdit}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="secondary" disabled={isSubmittingEdit}>
                    {isSubmittingEdit ? 'Saving Changes...' : 'Save Pipeline Changes'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal 3: Shift Status / Log Error */}
      {statusPipeline && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Update Pipeline Status</CardTitle>
                <CardDescription>Shift stream execution state or log failure details.</CardDescription>
              </div>
              <button
                onClick={() => setStatusPipeline(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleStatusSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                    Select Target Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as PipelineStatus)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white"
                  >
                    <option value="ACTIVE">ACTIVE (Running Stream)</option>
                    <option value="SYNCING">SYNCING (ETL Data Sync)</option>
                    <option value="STOPPED">STOPPED (Paused)</option>
                    <option value="COMPLETED">COMPLETED (Batch Finished)</option>
                    <option value="FAILED">FAILED (Log Exception)</option>
                  </select>
                </div>

                {newStatus === 'FAILED' && (
                  <TextArea
                    label="Failure Log / Error Message"
                    placeholder="Enter ingestion exception traceback logs..."
                    value={statusErrorMessage}
                    onChange={(e) => setStatusErrorMessage(e.target.value)}
                    required
                  />
                )}

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStatusPipeline(null)}
                    disabled={isSubmittingStatus}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="secondary" disabled={isSubmittingStatus}>
                    {isSubmittingStatus ? 'Updating Status...' : 'Apply Status Change'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal 4: Inspect Pipeline Detail Inspector */}
      {selectedPipelineId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <Badge variant="outline" className="font-mono text-xs mb-1">
                  REF: {selectedPipelineId.slice(0, 8).toUpperCase()}
                </Badge>
                <CardTitle className="text-xl">
                  {isLoadingDetail ? <Skeleton className="h-6 w-3/4" /> : pipelineDetail?.name}
                </CardTitle>
              </div>
              <button
                onClick={() => setSelectedPipelineId(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              {isLoadingDetail ? (
                <div className="space-y-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : pipelineDetail ? (
                <>
                  <div className="p-4 bg-slate-50 dark:bg-dark border border-slate-200/60 dark:border-slate-800 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-400 uppercase font-mono">
                        Pipeline Status
                      </span>
                      <Badge
                        variant={
                          pipelineDetail.status === 'ACTIVE' || pipelineDetail.status === 'COMPLETED'
                            ? 'success'
                            : pipelineDetail.status === 'FAILED'
                            ? 'danger'
                            : 'secondary'
                        }
                      >
                        {pipelineDetail.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                      <div>
                        <span className="text-slate-400 block font-mono text-[10px]">Data Source</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {pipelineDetail.source}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 block font-mono text-[10px]">Data Target</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {pipelineDetail.target}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 block font-mono text-[10px]">Throughput Spec</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {pipelineDetail.volume}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 block font-mono text-[10px]">Progress</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {pipelineDetail.progress}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {pipelineDetail.errorMessage && (
                    <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl space-y-1">
                      <span className="text-xs font-bold text-red-700 dark:text-red-300 flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5" /> Pipeline Error Trace
                      </span>
                      <p className="text-xs font-mono text-red-600 dark:text-red-400">
                        {pipelineDetail.errorMessage}
                      </p>
                    </div>
                  )}

                  {pipelineDetail.description && (
                    <div className="space-y-1">
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Architecture Description
                      </h4>
                      <p className="p-3 bg-slate-50 dark:bg-dark border border-slate-200/60 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                        {pipelineDetail.description}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3">
                    <div>
                      <span>Last Run: </span>
                      <span>
                        {pipelineDetail.lastRunAt
                          ? new Date(pipelineDetail.lastRunAt).toLocaleString()
                          : 'N/A'}
                      </span>
                    </div>

                    <div>
                      <span>Created At: </span>
                      <span>{new Date(pipelineDetail.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <Button variant="outline" onClick={() => setSelectedPipelineId(null)}>
                      Close
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setEditingPipeline(pipelineDetail);
                        setSelectedPipelineId(null);
                      }}
                    >
                      Edit Pipeline Specs
                    </Button>
                  </div>
                </>
              ) : null}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal 5: Delete / Archive Confirmation */}
      {deletingPipelineId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md text-left">
            <CardHeader>
              <CardTitle className="text-red-600 dark:text-red-400 flex items-center gap-2">
                <Trash2 className="h-5 w-5" /> Archive Data Pipeline?
              </CardTitle>
              <CardDescription>
                This action will archive the streaming pipeline from active cluster telemetry.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Are you sure you want to soft-delete pipeline ID{' '}
                <span className="font-mono font-bold">{deletingPipelineId.slice(0, 8)}</span>?
              </p>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button
                  variant="outline"
                  onClick={() => setDeletingPipelineId(null)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Archiving...' : 'Confirm Archive'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminPipelines;
