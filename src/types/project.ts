import type { BaseQueryParams } from './api';

export interface ProjectClient {
  id: string;
  name: string;
  code: string;
}

export interface ProjectManager {
  id: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
}

export interface ProjectSummary {
  id: string;
  name: string;
  code: string;
  status: string;
  clientId: string;
  client?: ProjectClient;
  projectManagerId: string | null;
  projectManager?: ProjectManager | null;
  startDate: string | null;
  endDate: string | null;
  budget: number | null;
  createdAt: string;
}

export interface ProjectDetail extends ProjectSummary {
  description: string | null;
  updatedAt: string;
}

export interface CreateProjectRequest {
  name: string;
  code: string;
  clientId: string;
  description?: string;
  projectManagerId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
}

export interface UpdateProjectRequest {
  name?: string;
  code?: string;
  clientId?: string;
  description?: string;
  projectManagerId?: string | null;
  status?: string;
  startDate?: string | null;
  endDate?: string | null;
  budget?: number | null;
}

export interface FindProjectsQuery extends BaseQueryParams {
  status?: string;
  clientId?: string;
  projectManagerId?: string;
}
