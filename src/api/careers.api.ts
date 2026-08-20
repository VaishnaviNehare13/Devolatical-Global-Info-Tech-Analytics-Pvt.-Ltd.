import { apiClient } from './client';

export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'HYBRID_REMOTE';
  salaryRange: string | null;
  description: string;
  requirements: string | null;
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'CLOSED';
  createdAt: string;
  updatedAt?: string;
  applicationsCount?: number;
}

export interface JobApplication {
  id: string;
  jobId: string;
  applicantName: string;
  email: string;
  phone: string | null;
  portfolioUrl: string | null;
  coverMessage: string | null;
  resumeFileName: string | null;
  resumeFileUrl: string | null;
  resumeMimeType: string | null;
  resumeFileSize: number | null;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'SHORTLISTED' | 'INTERVIEWING' | 'OFFERED' | 'REJECTED' | 'WITHDRAWN';
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  reviewedAt: string | null;
  job?: Job;
}

export interface FindJobsParams extends Record<string, unknown> {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  employmentType?: string;
  status?: string;
}

export interface FindApplicationsParams extends Record<string, unknown> {
  page?: number;
  limit?: number;
  search?: string;
  jobId?: string;
  status?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const careersApi = {
  // Public APIs
  getPublicJobs: async (params?: FindJobsParams): Promise<ApiResponse<PaginatedResponse<Job>>> => {
    return apiClient.get<ApiResponse<PaginatedResponse<Job>>>('/careers/jobs', { params, skipAuth: true });
  },

  getPublicJobById: async (id: string): Promise<ApiResponse<Job>> => {
    return apiClient.get<ApiResponse<Job>>(`/careers/jobs/${id}`, { skipAuth: true });
  },

  submitApplication: async (jobId: string, formData: FormData): Promise<ApiResponse<JobApplication>> => {
    return apiClient.upload<ApiResponse<JobApplication>>(`/careers/jobs/${jobId}/applications`, formData, { skipAuth: true });
  },

  // Admin APIs
  getAdminJobs: async (params?: FindJobsParams): Promise<ApiResponse<PaginatedResponse<Job>>> => {
    return apiClient.get<ApiResponse<PaginatedResponse<Job>>>('/careers/jobs-admin/all', { params });
  },

  createAdminJob: async (data: Partial<Job>): Promise<ApiResponse<Job>> => {
    return apiClient.post<ApiResponse<Job>>('/careers/jobs', data);
  },

  updateAdminJob: async (id: string, data: Partial<Job>): Promise<ApiResponse<Job>> => {
    return apiClient.patch<ApiResponse<Job>>(`/careers/jobs/${id}`, data);
  },

  archiveAdminJob: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/careers/jobs/${id}`);
  },

  getAdminApplications: async (params?: FindApplicationsParams): Promise<ApiResponse<PaginatedResponse<JobApplication>>> => {
    return apiClient.get<ApiResponse<PaginatedResponse<JobApplication>>>('/careers/applications', { params });
  },

  getAdminApplicationById: async (id: string): Promise<ApiResponse<JobApplication>> => {
    return apiClient.get<ApiResponse<JobApplication>>(`/careers/applications/${id}`);
  },

  updateAdminApplication: async (id: string, data: { status?: string; notes?: string | null }): Promise<ApiResponse<JobApplication>> => {
    return apiClient.patch<ApiResponse<JobApplication>>(`/careers/applications/${id}`, data);
  },

  archiveAdminApplication: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/careers/applications/${id}`);
  },
};
