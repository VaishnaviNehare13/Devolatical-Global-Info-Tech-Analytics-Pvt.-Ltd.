import { ProjectBaseOutput, ProjectDetailOutput } from '../repository/project.repository.types';

export interface ProjectClientInput {
  id: string;
  name: string;
  code: string;
  [key: string]: unknown;
}

export interface ProjectManagerInput {
  id: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
  [key: string]: unknown;
}

export interface ProjectBaseInput extends ProjectBaseOutput {
  client?: ProjectClientInput;
  projectManager?: ProjectManagerInput | null;
}

export interface ProjectDetailInput extends ProjectDetailOutput {
  client?: ProjectClientInput;
  projectManager?: ProjectManagerInput | null;
}

export interface PaginatedProjectsInput {
  items: ProjectBaseInput[];
  total: number;
  page: number;
  limit: number;
}

export interface ProjectClientResponse {
  id: string;
  name: string;
  code: string;
}

export interface ProjectManagerResponse {
  id: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
}

export interface ProjectSummaryResponse {
  id: string;
  name: string;
  code: string;
  status: string;
  clientId: string;
  client?: ProjectClientResponse;
  projectManagerId: string | null;
  projectManager?: ProjectManagerResponse | null;
  startDate: string | null;
  endDate: string | null;
  budget: number | null;
  createdAt: string;
}

export interface ProjectDetailResponse extends ProjectSummaryResponse {
  description: string | null;
  updatedAt: string;
}

export interface PaginatedProjectsResponse {
  items: ProjectSummaryResponse[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Pure Mapper responsible for transforming Projects service outputs into API response structures.
 * Contains no business logic, database queries, or framework-specific objects.
 */
export class ProjectMapper {
  /**
   * Transforms a base project summary output into a presentation-safe response model.
   */
  public static toSummaryResponse(project: ProjectBaseInput): ProjectSummaryResponse {
    return {
      id: project.id,
      name: project.name,
      code: project.code,
      status: project.status,
      clientId: project.clientId,
      client: project.client
        ? {
            id: project.client.id,
            name: project.client.name,
            code: project.client.code,
          }
        : undefined,
      projectManagerId: project.projectManagerId,
      projectManager: project.projectManager
        ? {
            id: project.projectManager.id,
            displayName: project.projectManager.displayName,
            email: project.projectManager.email,
            avatarUrl: project.projectManager.avatarUrl ?? null,
          }
        : project.projectManager === null
          ? null
          : undefined,
      startDate: project.startDate ? project.startDate.toISOString() : null,
      endDate: project.endDate ? project.endDate.toISOString() : null,
      budget: project.budget ? Number(project.budget) : null,
      createdAt: project.createdAt.toISOString(),
    };
  }

  /**
   * Transforms a detailed project output into a presentation-safe response model.
   * Excludes internal database properties (like deletedAt, createdById, updatedById).
   */
  public static toDetailResponse(project: ProjectDetailInput): ProjectDetailResponse {
    return {
      id: project.id,
      name: project.name,
      code: project.code,
      status: project.status,
      clientId: project.clientId,
      client: project.client
        ? {
            id: project.client.id,
            name: project.client.name,
            code: project.client.code,
          }
        : undefined,
      projectManagerId: project.projectManagerId,
      projectManager: project.projectManager
        ? {
            id: project.projectManager.id,
            displayName: project.projectManager.displayName,
            email: project.projectManager.email,
            avatarUrl: project.projectManager.avatarUrl ?? null,
          }
        : project.projectManager === null
          ? null
          : undefined,
      startDate: project.startDate ? project.startDate.toISOString() : null,
      endDate: project.endDate ? project.endDate.toISOString() : null,
      budget: project.budget ? Number(project.budget) : null,
      createdAt: project.createdAt.toISOString(),
      description: project.description ?? null,
      updatedAt: project.updatedAt.toISOString(),
    };
  }

  /**
   * Transforms a paginated project list output into a presentation-safe response model.
   */
  public static toPaginatedResponse(paginated: PaginatedProjectsInput): PaginatedProjectsResponse {
    return {
      items: paginated.items.map((item) => this.toSummaryResponse(item)),
      total: paginated.total,
      page: paginated.page,
      limit: paginated.limit,
    };
  }
}
