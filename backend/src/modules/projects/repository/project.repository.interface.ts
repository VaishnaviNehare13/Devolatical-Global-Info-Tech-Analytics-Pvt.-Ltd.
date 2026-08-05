import {
  CreateProjectRepositoryInput,
  UpdateProjectRepositoryInput,
  ProjectDetailOutput,
  FindProjectsRepositoryOptions,
  ProjectFiltersInput,
  PaginatedProjectsOutput,
  QueryOptions,
} from './project.repository.types';

/**
 * Project Repository contract interface.
 * Defines query boundaries for managing project-specific persistent states.
 */
export interface IProjectRepository {
  /**
   * Creates a new Project record.
   *
   * @param data Fields to create the project record
   * @returns Detailed project output
   */
  create(data: CreateProjectRepositoryInput): Promise<ProjectDetailOutput>;

  /**
   * Finds a project by unique ID. Excludes soft-deleted records by default.
   *
   * @param id The unique identifier of the project
   * @param options Query options (e.g. to include soft-deleted records)
   * @returns ProjectDetailOutput or null if not found
   */
  findById(id: string, options?: QueryOptions): Promise<ProjectDetailOutput | null>;

  /**
   * Finds a project by unique code. Excludes soft-deleted records by default.
   *
   * @param code The unique project code
   * @param options Query options (e.g. to include soft-deleted records)
   * @returns ProjectDetailOutput or null if not found
   */
  findByCode(code: string, options?: QueryOptions): Promise<ProjectDetailOutput | null>;

  /**
   * Finds, filters, and paginates project list. Excludes soft-deleted records by default.
   *
   * @param options Sorting, pagination, searching, and filtering options
   * @returns Paginated base project summaries with count metadata
   */
  findMany(options: FindProjectsRepositoryOptions): Promise<PaginatedProjectsOutput>;

  /**
   * Counts the projects matching filter criteria. Excludes soft-deleted records by default.
   *
   * @param filters Filtering options
   * @returns Total count of matching project records
   */
  count(filters: ProjectFiltersInput): Promise<number>;

  /**
   * Updates an existing Project record.
   *
   * @param id The unique identifier of the project
   * @param data Fields to update
   * @returns Updated detailed project output or null if not found
   */
  update(id: string, data: UpdateProjectRepositoryInput): Promise<ProjectDetailOutput | null>;

  /**
   * Performs soft deletion of a project record. Marks deletedAt and sets status to ARCHIVED.
   *
   * @param id The unique identifier of the project
   * @returns Boolean indicating whether deletion succeeded
   */
  softDelete(id: string): Promise<boolean>;

  /**
   * Checks if a project with the given code exists. Includes soft-deleted records.
   *
   * @param code The project code
   * @returns Boolean indicating existence
   */
  existsByCode(code: string): Promise<boolean>;
}
