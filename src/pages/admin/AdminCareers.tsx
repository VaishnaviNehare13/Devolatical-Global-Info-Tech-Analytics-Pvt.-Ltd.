import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { TextArea } from '../../components/ui/TextArea';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';
import { careersApi } from '../../api/careers.api';
import type { Job, JobApplication } from '../../api/careers.api';
import { ApiError } from '../../types/api';
import {
  Briefcase,
  Users,
  Search,
  RefreshCw,
  Plus,
  Eye,
  Trash2,
  AlertCircle,
  Filter,
  FileText,
  ExternalLink,
  CheckCircle2,
  Clock,
} from 'lucide-react';

export const AdminCareers: React.FC = () => {
  const { showToast } = useToast();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'APPLICATIONS' | 'JOBS'>('APPLICATIONS');

  // Applications Data State
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [totalApplications, setTotalApplications] = useState<number>(0);
  const [isLoadingApps, setIsLoadingApps] = useState<boolean>(true);
  const [isRefreshingApps, setIsRefreshingApps] = useState<boolean>(false);
  const [appsLoadError, setAppsLoadError] = useState<string | null>(null);

  // Application Filters
  const [appSearch, setAppSearch] = useState<string>('');
  const [appStatusFilter, setAppStatusFilter] = useState<string>('ALL');
  const [appJobFilter, setAppJobFilter] = useState<string>('ALL');

  // Jobs Data State
  const [jobs, setJobs] = useState<Job[]>([]);
  const [totalJobs, setTotalJobs] = useState<number>(0);
  const [isLoadingJobs, setIsLoadingJobs] = useState<boolean>(true);

  // Application Modals
  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);
  const [isAppDetailModalOpen, setIsAppDetailModalOpen] = useState<boolean>(false);
  const [updateAppStatus, setUpdateAppStatus] = useState<string>('');
  const [updateAppNotes, setUpdateAppNotes] = useState<string>('');
  const [isSubmittingAppUpdate, setIsSubmittingAppUpdate] = useState<boolean>(false);

  // Job Modals
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isCreateJobModalOpen, setIsCreateJobModalOpen] = useState<boolean>(false);
  const [isEditJobModalOpen, setIsEditJobModalOpen] = useState<boolean>(false);
  const [isSubmittingJob, setIsSubmittingJob] = useState<boolean>(false);

  // Job Form State
  const [jobForm, setJobForm] = useState<{
    title: string;
    department: string;
    location: string;
    employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'HYBRID_REMOTE';
    salaryRange: string;
    description: string;
    requirements: string;
    status: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'CLOSED';
  }>({
    title: '',
    department: 'Data Analytics',
    location: 'Andheri West, Mumbai (Hybrid / Remote)',
    employmentType: 'FULL_TIME',
    salaryRange: 'Competitive Enterprise Package',
    description: '',
    requirements: '',
    status: 'ACTIVE',
  });
  const [jobFormErrors, setJobFormErrors] = useState<Record<string, string>>({});

  // Fetch Applications
  const fetchApplications = useCallback(
    async (silent = false) => {
      if (silent) setIsRefreshingApps(true);
      else setIsLoadingApps(true);
      setAppsLoadError(null);

      try {
        const params = {
          limit: 100,
          search: appSearch.trim() || undefined,
          status: appStatusFilter !== 'ALL' ? appStatusFilter : undefined,
          jobId: appJobFilter !== 'ALL' ? appJobFilter : undefined,
        };

        const res = await careersApi.getAdminApplications(params);
        if (res.data) {
          setApplications(res.data.items || []);
          setTotalApplications(res.data.total ?? res.data.items?.length ?? 0);
        }
      } catch (err: unknown) {
        const message = ApiError.isApiError(err) ? err.message : 'Failed to retrieve job applications.';
        setAppsLoadError(message);
        showToast(message, 'error');
      } finally {
        setIsLoadingApps(false);
        setIsRefreshingApps(false);
      }
    },
    [appSearch, appStatusFilter, appJobFilter, showToast]
  );

  // Fetch Jobs
  const fetchJobs = useCallback(async () => {
    setIsLoadingJobs(true);
    try {
      const res = await careersApi.getAdminJobs({ limit: 100 });
      if (res.data) {
        setJobs(res.data.items || []);
        setTotalJobs(res.data.total ?? res.data.items?.length ?? 0);
      }
    } catch (err: unknown) {
      const message = ApiError.isApiError(err) ? err.message : 'Failed to retrieve job postings.';
      showToast(message, 'error');
    } finally {
      setIsLoadingJobs(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchApplications();
    fetchJobs();
  }, [fetchApplications, fetchJobs]);

  // Open Application Detail Modal
  const handleOpenAppDetail = (app: JobApplication) => {
    setSelectedApp(app);
    setUpdateAppStatus(app.status);
    setUpdateAppNotes(app.notes || '');
    setIsAppDetailModalOpen(true);
  };

  // Save Application Update
  const handleSaveAppUpdate = async () => {
    if (!selectedApp) return;
    setIsSubmittingAppUpdate(true);
    try {
      const res = await careersApi.updateAdminApplication(selectedApp.id, {
        status: updateAppStatus,
        notes: updateAppNotes.trim() || null,
      });

      showToast(`Application status for ${selectedApp.applicantName} updated to ${updateAppStatus}.`, 'success');
      if (res.data) {
        setApplications((prev) => prev.map((a) => (a.id === res.data.id ? res.data : a)));
      }
      setIsAppDetailModalOpen(false);
    } catch (err: unknown) {
      const message = ApiError.isApiError(err) ? err.message : 'Failed to update application status.';
      showToast(message, 'error');
    } finally {
      setIsSubmittingAppUpdate(false);
    }
  };

  // Handle Archive Application
  const handleArchiveApp = async (id: string, name: string) => {
    try {
      await careersApi.archiveAdminApplication(id);
      showToast(`Application from ${name} archived successfully.`, 'success');
      fetchApplications();
    } catch (err: unknown) {
      const message = ApiError.isApiError(err) ? err.message : 'Failed to archive application.';
      showToast(message, 'error');
    }
  };

  // Handle Job Form Submit (Create)
  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!jobForm.title.trim()) errors.title = 'Job title is required.';
    if (!jobForm.department.trim()) errors.department = 'Department is required.';
    if (!jobForm.description.trim()) errors.description = 'Job description is required.';

    if (Object.keys(errors).length > 0) {
      setJobFormErrors(errors);
      return;
    }

    setJobFormErrors({});
    setIsSubmittingJob(true);
    try {
      const res = await careersApi.createAdminJob(jobForm);
      showToast(`Job posting "${res.data.title}" created successfully.`, 'success');
      setIsCreateJobModalOpen(false);
      setJobForm({
        title: '',
        department: 'Data Analytics',
        location: 'Andheri West, Mumbai (Hybrid / Remote)',
        employmentType: 'FULL_TIME',
        salaryRange: 'Competitive Enterprise Package',
        description: '',
        requirements: '',
        status: 'ACTIVE',
      });
      fetchJobs();
    } catch (err: unknown) {
      const message = ApiError.isApiError(err) ? err.message : 'Failed to create job posting.';
      showToast(message, 'error');
    } finally {
      setIsSubmittingJob(false);
    }
  };

  // Handle Job Form Submit (Edit)
  const handleEditJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;
    setIsSubmittingJob(true);
    try {
      const res = await careersApi.updateAdminJob(selectedJob.id, jobForm);
      showToast(`Job posting "${res.data.title}" updated successfully.`, 'success');
      setIsEditJobModalOpen(false);
      fetchJobs();
    } catch (err: unknown) {
      const message = ApiError.isApiError(err) ? err.message : 'Failed to update job posting.';
      showToast(message, 'error');
    } finally {
      setIsSubmittingJob(false);
    }
  };

  // Open Edit Job Modal
  const handleOpenEditJob = (job: Job) => {
    setSelectedJob(job);
    setJobForm({
      title: job.title,
      department: job.department,
      location: job.location,
      employmentType: job.employmentType,
      salaryRange: job.salaryRange || '',
      description: job.description,
      requirements: job.requirements || '',
      status: job.status,
    });
    setIsEditJobModalOpen(true);
  };

  // Archive Job
  const handleArchiveJob = async (id: string, title: string) => {
    try {
      await careersApi.archiveAdminJob(id);
      showToast(`Job posting "${title}" closed and archived.`, 'success');
      fetchJobs();
    } catch (err: unknown) {
      const message = ApiError.isApiError(err) ? err.message : 'Failed to archive job posting.';
      showToast(message, 'error');
    }
  };

  // Application Status Badge helper
  const getAppStatusBadge = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return <Badge variant="accent">Submitted</Badge>;
      case 'UNDER_REVIEW':
        return <Badge variant="warning">Under Review</Badge>;
      case 'SHORTLISTED':
      case 'INTERVIEWING':
        return <Badge variant="secondary">{status.replace('_', ' ')}</Badge>;
      case 'OFFERED':
        return <Badge variant="success">Offered</Badge>;
      case 'REJECTED':
        return <Badge variant="danger">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Application table columns
  const appColumns = [
    {
      key: 'applicantName' as keyof JobApplication,
      header: 'Applicant / Contact',
      render: (row: JobApplication) => (
        <div className="space-y-0.5">
          <div className="font-bold text-slate-900 dark:text-white text-xs">{row.applicantName}</div>
          <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5">
            <span>{row.email}</span>
            {row.phone && (
              <>
                <span>•</span>
                <span>{row.phone}</span>
              </>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'jobId' as keyof JobApplication,
      header: 'Applied Position',
      render: (row: JobApplication) => (
        <div className="space-y-0.5">
          <div className="font-semibold text-xs text-slate-800 dark:text-slate-200">
            {row.job?.title || 'Engineering Position'}
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            {row.job?.department || 'Engineering'}
          </div>
        </div>
      ),
    },
    {
      key: 'resumeFileName' as keyof JobApplication,
      header: 'Resume File',
      render: (row: JobApplication) =>
        row.resumeFileUrl ? (
          <a
            href={`http://localhost:5000${row.resumeFileUrl}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center text-xs font-semibold text-secondary hover:underline"
          >
            <FileText className="h-3.5 w-3.5 mr-1" />
            <span>{row.resumeFileName || 'Resume.pdf'}</span>
          </a>
        ) : (
          <span className="text-xs text-slate-400 font-mono">No File</span>
        ),
    },
    {
      key: 'status' as keyof JobApplication,
      header: 'Status',
      render: (row: JobApplication) => getAppStatusBadge(row.status),
    },
    {
      key: 'createdAt' as keyof JobApplication,
      header: 'Applied Date',
      render: (row: JobApplication) => (
        <div className="text-xs font-mono text-slate-500">
          {new Date(row.createdAt).toLocaleDateString()}
        </div>
      ),
    },
    {
      key: 'id' as keyof JobApplication,
      header: 'Actions',
      render: (row: JobApplication) => (
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => handleOpenAppDetail(row)}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
            title="Review Candidate"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => handleArchiveApp(row.id, row.applicantName)}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 cursor-pointer"
            title="Archive Application"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];

  // Job table columns
  const jobColumns = [
    {
      key: 'title' as keyof Job,
      header: 'Job Title / Department',
      render: (row: Job) => (
        <div className="space-y-0.5">
          <div className="font-bold text-slate-900 dark:text-white text-xs">{row.title}</div>
          <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5">
            <Badge variant="outline" className="text-[8px] uppercase">
              {row.department}
            </Badge>
            <span>•</span>
            <span>{row.location}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'employmentType' as keyof Job,
      header: 'Type',
      render: (row: Job) => (
        <span className="text-xs font-mono font-semibold text-slate-600 dark:text-slate-300">
          {row.employmentType.replace('_', ' ')}
        </span>
      ),
    },
    {
      key: 'applicationsCount' as keyof Job,
      header: 'Applications',
      render: (row: Job) => (
        <Badge variant="secondary" className="font-mono text-xs">
          {row.applicationsCount ?? 0} Received
        </Badge>
      ),
    },
    {
      key: 'status' as keyof Job,
      header: 'Status',
      render: (row: Job) =>
        row.status === 'ACTIVE' ? (
          <Badge variant="success">Active</Badge>
        ) : (
          <Badge variant="outline">{row.status}</Badge>
        ),
    },
    {
      key: 'id' as keyof Job,
      header: 'Actions',
      render: (row: Job) => (
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => handleOpenEditJob(row)}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
            title="Edit Posting"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => handleArchiveJob(row.id, row.title)}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 cursor-pointer"
            title="Close Job"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];

  // Counts for KPIs
  const submittedCount = applications.filter((a) => a.status === 'SUBMITTED').length;
  const interviewingCount = applications.filter(
    (a) => a.status === 'SHORTLISTED' || a.status === 'INTERVIEWING' || a.status === 'OFFERED'
  ).length;
  const activeJobsCount = jobs.filter((j) => j.status === 'ACTIVE').length;

  return (
    <div className="space-y-6 text-left">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Recruitment & Candidate Portal</h1>
            <Badge variant="secondary" className="font-mono text-xs">
              {totalApplications} Applicants
            </Badge>
          </div>
          <p className="text-sm text-slate-500">
            Review candidate applications, manage engineering resume attachments, and maintain open job role postings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchApplications(true)}
            disabled={isLoadingApps || isRefreshingApps}
          >
            <RefreshCw className={`h-4 w-4 mr-1.5 ${isRefreshingApps ? 'animate-spin' : ''}`} />
            Sync Applicants
          </Button>

          <Button variant="secondary" size="sm" onClick={() => setIsCreateJobModalOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            New Job Posting
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Applicants
            </span>
            <Users className="h-5 w-5 text-secondary" />
          </div>
          <div className="mt-4">
            {isLoadingApps ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <h3 className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
                  {totalApplications} Submissions
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-1">Database recruitment records</p>
              </>
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Pending Review
            </span>
            <Clock className="h-5 w-5 text-amber-500" />
          </div>
          <div className="mt-4">
            {isLoadingApps ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <h3 className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
                  {submittedCount} Unreviewed
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-1">Status: SUBMITTED</p>
              </>
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Shortlisted / Pipeline
            </span>
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="mt-4">
            {isLoadingApps ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <h3 className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
                  {interviewingCount} Candidates
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-1">Shortlisted or Interviewing</p>
              </>
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Active Job Openings
            </span>
            <Briefcase className="h-5 w-5 text-accent" />
          </div>
          <div className="mt-4">
            {isLoadingJobs ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <h3 className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
                  {activeJobsCount} Active
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-1">{totalJobs} Total Job Postings</p>
              </>
            )}
          </div>
        </Card>
      </div>

      {/* Error Alert Box */}
      {appsLoadError && (
        <Card className="p-6 text-center space-y-3 bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900">
          <AlertCircle className="h-8 w-8 text-danger mx-auto" />
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
              Recruitment Directory Synchronization Alert
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">{appsLoadError}</p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => fetchApplications(false)}>
            Retry Applicants Sync
          </Button>
        </Card>
      )}

      {/* Tab Switcher */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex space-x-6">
        <button
          onClick={() => setActiveTab('APPLICATIONS')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider cursor-pointer flex items-center gap-2 ${
            activeTab === 'APPLICATIONS'
              ? 'border-b-2 border-secondary text-secondary'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
          }`}
        >
          <Users className="h-4 w-4" />
          Job Applications Queue ({totalApplications})
        </button>

        <button
          onClick={() => setActiveTab('JOBS')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider cursor-pointer flex items-center gap-2 ${
            activeTab === 'JOBS'
              ? 'border-b-2 border-secondary text-secondary'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
          }`}
        >
          <Briefcase className="h-4 w-4" />
          Job Postings ({totalJobs})
        </button>
      </div>

      {/* Tab 1: Applications Queue */}
      {activeTab === 'APPLICATIONS' && (
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle>Job Applications Directory</CardTitle>
                <CardDescription>
                  Review candidate profiles, download resume attachments, and update recruitment status.
                </CardDescription>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search applicants..."
                    value={appSearch}
                    onChange={(e) => setAppSearch(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg text-xs outline-none focus:border-secondary w-48"
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  <Filter className="h-3.5 w-3.5 text-slate-400" />
                  <select
                    value={appStatusFilter}
                    onChange={(e) => setAppStatusFilter(e.target.value)}
                    className="px-3 py-2 bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg text-xs outline-none focus:border-secondary"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="SUBMITTED">Submitted</option>
                    <option value="UNDER_REVIEW">Under Review</option>
                    <option value="SHORTLISTED">Shortlisted</option>
                    <option value="INTERVIEWING">Interviewing</option>
                    <option value="OFFERED">Offered</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>

                <select
                  value={appJobFilter}
                  onChange={(e) => setAppJobFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg text-xs outline-none focus:border-secondary"
                >
                  <option value="ALL">All Positions</option>
                  {jobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingApps ? (
              <div className="space-y-3 py-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              <DataTable columns={appColumns} data={applications} searchKey="applicantName" rowsPerPage={10} />
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab 2: Job Postings */}
      {activeTab === 'JOBS' && (
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle>Job Role Management</CardTitle>
                <CardDescription>
                  Create, update, or archive active job role postings displayed on the public Careers portal.
                </CardDescription>
              </div>
              <Button variant="secondary" size="sm" onClick={() => setIsCreateJobModalOpen(true)}>
                <Plus className="h-4 w-4 mr-1.5" />
                Add Position
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingJobs ? (
              <div className="space-y-3 py-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              <DataTable columns={jobColumns} data={jobs} searchKey="title" rowsPerPage={10} />
            )}
          </CardContent>
        </Card>
      )}

      {/* Application Review Modal */}
      {selectedApp && (
        <Modal
          isOpen={isAppDetailModalOpen}
          onClose={() => setIsAppDetailModalOpen(false)}
          title={`Review Candidate: ${selectedApp.applicantName}`}
        >
          <div className="space-y-4 text-left">
            <div className="p-4 bg-slate-50 dark:bg-dark border border-slate-100 dark:border-slate-800 rounded-xl space-y-2">
              <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <span className="text-slate-400 block">Applicant Name:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedApp.applicantName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Contact Email:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedApp.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Phone Number:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {selectedApp.phone || 'Not provided'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Applied Position:</span>
                  <span className="font-bold text-secondary">{selectedApp.job?.title || 'Engineering Role'}</span>
                </div>
              </div>
            </div>

            {selectedApp.portfolioUrl && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono mb-1">
                  Portfolio / GitHub Link
                </label>
                <a
                  href={selectedApp.portfolioUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-secondary hover:underline flex items-center gap-1 font-mono"
                >
                  {selectedApp.portfolioUrl}
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            )}

            {selectedApp.resumeFileUrl && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono mb-1">
                  Attached Resume File
                </label>
                <a
                  href={`http://localhost:5000${selectedApp.resumeFileUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center p-3 bg-secondary/10 text-secondary border border-secondary/20 rounded-lg text-xs font-bold hover:bg-secondary/20"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  <span>Download / View Resume ({selectedApp.resumeFileName})</span>
                  <ExternalLink className="h-3.5 w-3.5 ml-2" />
                </a>
              </div>
            )}

            {selectedApp.coverMessage && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono mb-1">
                  Cover Note / Message
                </label>
                <div className="p-3 bg-slate-50 dark:bg-dark border border-slate-100 dark:border-slate-800 rounded-lg text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                  {selectedApp.coverMessage}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono mb-1.5">
                  Update Candidate Status
                </label>
                <select
                  value={updateAppStatus}
                  onChange={(e) => setUpdateAppStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-secondary"
                >
                  <option value="SUBMITTED">SUBMITTED</option>
                  <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                  <option value="SHORTLISTED">SHORTLISTED</option>
                  <option value="INTERVIEWING">INTERVIEWING</option>
                  <option value="OFFERED">OFFERED</option>
                  <option value="REJECTED">REJECTED</option>
                  <option value="WITHDRAWN">WITHDRAWN</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono mb-1.5">
                  Internal Reviewer Notes
                </label>
                <input
                  type="text"
                  value={updateAppNotes}
                  onChange={(e) => setUpdateAppNotes(e.target.value)}
                  placeholder="Add evaluation feedback..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white outline-none focus:border-secondary"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" size="sm" onClick={() => setIsAppDetailModalOpen(false)} disabled={isSubmittingAppUpdate}>
                Cancel
              </Button>
              <Button variant="secondary" size="sm" onClick={handleSaveAppUpdate} disabled={isSubmittingAppUpdate}>
                {isSubmittingAppUpdate ? 'Saving...' : 'Save Candidate Review'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Create Job Modal */}
      <Modal isOpen={isCreateJobModalOpen} onClose={() => setIsCreateJobModalOpen(false)} title="Create New Job Posting">
        <form onSubmit={handleCreateJob} className="space-y-4 text-left">
          <Input
            label="Job Title *"
            value={jobForm.title}
            onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
            error={jobFormErrors.title}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Department *"
              value={jobForm.department}
              onChange={(e) => setJobForm({ ...jobForm, department: e.target.value })}
              error={jobFormErrors.department}
              required
            />
            <Input
              label="Location"
              value={jobForm.location}
              onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono mb-1.5">
                Employment Type
              </label>
              <select
                value={jobForm.employmentType}
                onChange={(e) => setJobForm({ ...jobForm, employmentType: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white outline-none focus:border-secondary"
              >
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="CONTRACT">Contract</option>
                <option value="HYBRID_REMOTE">Hybrid / Remote</option>
              </select>
            </div>

            <Input
              label="Salary Range / Package"
              value={jobForm.salaryRange}
              onChange={(e) => setJobForm({ ...jobForm, salaryRange: e.target.value })}
            />
          </div>

          <TextArea
            label="Job Description *"
            value={jobForm.description}
            onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
            error={jobFormErrors.description}
            required
          />

          <TextArea
            label="Requirements & Qualifications"
            value={jobForm.requirements}
            onChange={(e) => setJobForm({ ...jobForm, requirements: e.target.value })}
          />

          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateJobModalOpen(false)} disabled={isSubmittingJob}>
              Cancel
            </Button>
            <Button type="submit" variant="secondary" size="sm" disabled={isSubmittingJob}>
              {isSubmittingJob ? 'Creating...' : 'Publish Job Posting'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Job Modal */}
      {selectedJob && (
        <Modal isOpen={isEditJobModalOpen} onClose={() => setIsEditJobModalOpen(false)} title={`Edit Job: ${selectedJob.title}`}>
          <form onSubmit={handleEditJob} className="space-y-4 text-left">
            <Input
              label="Job Title"
              value={jobForm.title}
              onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Department"
                value={jobForm.department}
                onChange={(e) => setJobForm({ ...jobForm, department: e.target.value })}
              />
              <Input
                label="Location"
                value={jobForm.location}
                onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono mb-1.5">
                  Employment Type
                </label>
                <select
                  value={jobForm.employmentType}
                  onChange={(e) => setJobForm({ ...jobForm, employmentType: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white outline-none focus:border-secondary"
                >
                  <option value="FULL_TIME">Full Time</option>
                  <option value="PART_TIME">Part Time</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="HYBRID_REMOTE">Hybrid / Remote</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono mb-1.5">
                  Job Status
                </label>
                <select
                  value={jobForm.status}
                  onChange={(e) => setJobForm({ ...jobForm, status: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white outline-none focus:border-secondary"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="DRAFT">DRAFT</option>
                  <option value="INACTIVE">INACTIVE</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>
            </div>

            <TextArea
              label="Job Description"
              value={jobForm.description}
              onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
            />

            <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsEditJobModalOpen(false)} disabled={isSubmittingJob}>
                Cancel
              </Button>
              <Button type="submit" variant="secondary" size="sm" disabled={isSubmittingJob}>
                {isSubmittingJob ? 'Updating...' : 'Save Job Updates'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default AdminCareers;
