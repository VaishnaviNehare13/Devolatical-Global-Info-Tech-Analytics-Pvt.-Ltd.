import {
  ProjectDetailOutput,
  PaginatedProjectsOutput,
  ProjectFiltersInput,
} from '../repository/project.repository.types';
import {
  CreateProjectServiceInput,
  UpdateProjectServiceInput,
  FindProjectsServiceOptions,
} from './project.service.types';

/**
 * Service Contract for managing Project business logic.
 * Encapsulates transactional orchestration, audit integration, and business validation.
 */
export interface IProjectService {
  /**
   * Creates a new project record, validates client and manager existence, and logs the action.
   *
   * @param data Payload to create a project
   * @param currentUserId The user creating the project
   * @returns Detailed project output
   */
  createProject(
    data: CreateProjectServiceInput,
    currentUserId: string
  ): Promise<ProjectDetailOutput>;

  /**
   * Retrieves a project by unique ID. Excludes soft-deleted records by default.
   *
   * @param id The unique identifier of the project
   * @returns Detailed project output
   */
  getProjectById(id: string): Promise<ProjectDetailOutput>;

  /**
   * Retrieves a project by unique code. Excludes soft-deleted records by default.
   *
   * @param code The unique abbreviation code of the project
   * @returns Detailed project output
   */
  getProjectByCode(code: string): Promise<ProjectDetailOutput>;

  /**
   * Searches, filters, and paginates project summaries.
   *
   * @param options Query, filter, and pagination options
   * @returns Paginated results containing items and count metadata
   */
  listProjects(options: FindProjectsServiceOptions): Promise<PaginatedProjectsOutput>;

  /**
   * Updates an existing active project profile and writes an audit log.
   *
   * @param id The unique identifier of the project to update
   * @param data Fields to update
   * @param currentUserId The user making the update
   * @returns Detailed updated project output
   */
  updateProject(
    id: string,
    data: UpdateProjectServiceInput,
    currentUserId: string
  ): Promise<ProjectDetailOutput>;

  /**
   * Soft deletes / archives a project, ensuring it is not already archived.
   *
   * @param id The unique identifier of the project to archive
   * @param currentUserId The user archiving the project
   * @returns Detailed updated project output
   */
  archiveProject(id: string, currentUserId: string): Promise<ProjectDetailOutput>;

  /**
   * Restores a soft-deleted project back to PLANNING status.
   *
   * @param id The unique identifier of the project to restore
   * @param currentUserId The user restoring the project
   * @returns Detailed updated project output
   */
  restoreProject(id: string, currentUserId: string): Promise<ProjectDetailOutput>;

  /**
   * Counts the projects matching filter criteria.
   *
   * @param filters Filtering options
   * @returns Total count of matching project records
   */
  countProjects(filters: ProjectFiltersInput): Promise<number>;
}
