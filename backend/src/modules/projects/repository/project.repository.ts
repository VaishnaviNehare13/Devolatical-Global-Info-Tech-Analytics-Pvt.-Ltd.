import { PrismaClient, Prisma, ProjectStatus } from '@prisma/client';
import { IProjectRepository } from './project.repository.interface';
import { PROJECT_BASE_SELECT, PROJECT_DETAIL_SELECT } from './project.repository.select';
import {
  CreateProjectRepositoryInput,
  UpdateProjectRepositoryInput,
  ProjectDetailOutput,
  FindProjectsRepositoryOptions,
  ProjectFiltersInput,
  PaginatedProjectsOutput,
  QueryOptions,
} from './project.repository.types';
import { ProjectRepositoryError } from './project.repository.errors';
import { PROJECT_PAGINATION, PROJECT_SORT } from '../constants/project.constants';

/**
 * Concrete Prisma-based Project Repository implementation.
 * Encapsulates database actions for the Projects module and translates errors.
 */
export class ProjectRepository implements IProjectRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Creates a new project record.
   */
  public async create(data: CreateProjectRepositoryInput): Promise<ProjectDetailOutput> {
    try {
      const result = await this.prisma.project.create({
        data: {
          name: data.name,
          code: data.code,
          description: data.description || null,
          status: data.status || ProjectStatus.PLANNING,
          clientId: data.clientId,
          projectManagerId: data.projectManagerId || null,
          startDate: data.startDate || null,
          endDate: data.endDate || null,
          budget: data.budget || null,
          createdById: data.createdById || null,
        },
        select: PROJECT_DETAIL_SELECT,
      });

      return result as unknown as ProjectDetailOutput;
    } catch (error) {
      throw new ProjectRepositoryError(
        'DATABASE_WRITE_FAILED',
        'Database write failed while creating project record.',
        error
      );
    }
  }

  /**
   * Retrieves a project by unique ID.
   */
  public async findById(id: string, options?: QueryOptions): Promise<ProjectDetailOutput | null> {
    try {
      const result = await this.prisma.project.findFirst({
        where: {
          id,
          deletedAt: options?.includeDeleted ? undefined : null,
        },
        select: PROJECT_DETAIL_SELECT,
      });

      return result as unknown as ProjectDetailOutput | null;
    } catch (error) {
      throw new ProjectRepositoryError(
        'DATABASE_READ_FAILED',
        `Database read failed while fetching project by ID ${id}.`,
        error
      );
    }
  }

  /**
   * Retrieves a project by unique code.
   */
  public async findByCode(
    code: string,
    options?: QueryOptions
  ): Promise<ProjectDetailOutput | null> {
    try {
      const result = await this.prisma.project.findFirst({
        where: {
          code,
          deletedAt: options?.includeDeleted ? undefined : null,
        },
        select: PROJECT_DETAIL_SELECT,
      });

      return result as unknown as ProjectDetailOutput | null;
    } catch (error) {
      throw new ProjectRepositoryError(
        'DATABASE_READ_FAILED',
        `Database read failed while fetching project by code ${code}.`,
        error
      );
    }
  }

  /**
   * Searches, filters, and paginates projects.
   */
  public async findMany(options: FindProjectsRepositoryOptions): Promise<PaginatedProjectsOutput> {
    try {
      const page = Math.max(1, options.pagination?.page ?? PROJECT_PAGINATION.DEFAULT_PAGE);
      const rawLimit = options.pagination?.limit ?? PROJECT_PAGINATION.DEFAULT_LIMIT;
      const limit = Math.min(PROJECT_PAGINATION.MAX_LIMIT, Math.max(1, rawLimit));
      const skip = (page - 1) * limit;

      const where = this.buildWhereClause({
        search: options.search,
        status: options.status,
        clientId: options.clientId,
        projectManagerId: options.projectManagerId,
        includeDeleted: options.includeDeleted,
      });

      const orderBy = this.buildOrderBy(options.sortField, options.sortOrder);

      const [total, items] = await Promise.all([
        this.prisma.project.count({ where }),
        this.prisma.project.findMany({
          where,
          select: PROJECT_BASE_SELECT,
          orderBy,
          skip,
          take: limit,
        }),
      ]);

      return {
        items: items as unknown as ProjectDetailOutput[],
        total,
        page,
        limit,
      };
    } catch (error) {
      throw new ProjectRepositoryError(
        'DATABASE_READ_FAILED',
        'Database read failed while listing projects.',
        error
      );
    }
  }

  /**
   * Counts projects matching filter options.
   */
  public async count(filters: ProjectFiltersInput): Promise<number> {
    try {
      const where = this.buildWhereClause(filters);
      return await this.prisma.project.count({ where });
    } catch (error) {
      throw new ProjectRepositoryError(
        'DATABASE_READ_FAILED',
        'Database read failed while counting projects.',
        error
      );
    }
  }

  /**
   * Updates an existing project record.
   */
  public async update(
    id: string,
    data: UpdateProjectRepositoryInput
  ): Promise<ProjectDetailOutput | null> {
    try {
      const result = await this.prisma.project.update({
        where: { id },
        data: {
          name: data.name,
          code: data.code,
          description: data.description,
          status: data.status,
          clientId: data.clientId,
          projectManagerId: data.projectManagerId,
          startDate: data.startDate,
          endDate: data.endDate,
          budget: data.budget,
          updatedById: data.updatedById,
          deletedAt: data.deletedAt,
        },
        select: PROJECT_DETAIL_SELECT,
      });

      return result as unknown as ProjectDetailOutput;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return null;
      }
      throw new ProjectRepositoryError(
        'DATABASE_UPDATE_FAILED',
        `Database update failed while updating project with ID ${id}.`,
        error
      );
    }
  }

  /**
   * Soft deletes a project record. Sets status to ARCHIVED.
   */
  public async softDelete(id: string): Promise<boolean> {
    try {
      await this.prisma.project.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          status: ProjectStatus.ARCHIVED,
        },
        select: { id: true },
      });
      return true;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return false;
      }
      throw new ProjectRepositoryError(
        'DATABASE_DELETE_FAILED',
        `Database update failed while soft-deleting project with ID ${id}.`,
        error
      );
    }
  }

  /**
   * Checks if a project with the given code exists.
   */
  public async existsByCode(code: string): Promise<boolean> {
    try {
      const count = await this.prisma.project.count({
        where: { code },
      });
      return count > 0;
    } catch (error) {
      throw new ProjectRepositoryError(
        'DATABASE_READ_FAILED',
        `Database read failed while checking project existence for code ${code}.`,
        error
      );
    }
  }

  /**
   * Prepares the Prisma `where` clause according to query criteria.
   */
  private buildWhereClause(filters: ProjectFiltersInput): Prisma.ProjectWhereInput {
    const where: Prisma.ProjectWhereInput = {};

    if (!filters.includeDeleted) {
      where.deletedAt = null;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.clientId) {
      where.clientId = filters.clientId;
    }

    if (filters.projectManagerId) {
      where.projectManagerId = filters.projectManagerId;
    }

    if (filters.search) {
      const searchTrim = filters.search.trim();
      where.OR = [
        { name: { contains: searchTrim, mode: 'insensitive' } },
        { code: { contains: searchTrim, mode: 'insensitive' } },
      ];
    }

    return where;
  }

  /**
   * Builds the Prisma `orderBy` parameter.
   */
  private buildOrderBy(
    sortField?: string,
    sortOrder?: 'asc' | 'desc'
  ): Prisma.ProjectOrderByWithRelationInput {
    const field = sortField || PROJECT_SORT.DEFAULT_FIELD;
    const order = sortOrder || PROJECT_SORT.DEFAULT_ORDER;
    return { [field]: order };
  }
}
