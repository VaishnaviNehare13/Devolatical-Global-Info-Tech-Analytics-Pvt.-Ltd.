import { PrismaClient, Prisma, MilestoneStatus } from '@prisma/client';
import { IMilestoneRepository } from './milestone.repository.interface';
import { MILESTONE_BASE_SELECT, MILESTONE_DETAIL_SELECT } from './milestone.repository.select';
import {
  CreateMilestoneRepositoryInput,
  UpdateMilestoneRepositoryInput,
  MilestoneDetailOutput,
  FindMilestonesRepositoryOptions,
  MilestoneFiltersInput,
  PaginatedMilestonesOutput,
  QueryOptions,
} from './milestone.repository.types';
import { MilestoneRepositoryError } from './milestone.repository.errors';
import { MILESTONE_PAGINATION, MILESTONE_SORT } from '../constants/milestone.constants';

export class MilestoneRepository implements IMilestoneRepository {
  constructor(private readonly prisma: PrismaClient) {}

  public async create(data: CreateMilestoneRepositoryInput): Promise<MilestoneDetailOutput> {
    try {
      const result = await this.prisma.milestone.create({
        data: {
          title: data.title,
          description: data.description || null,
          status: data.status || MilestoneStatus.PENDING,
          projectId: data.projectId,
          dueDate: data.dueDate || null,
          createdById: data.createdById || null,
        },
        select: MILESTONE_DETAIL_SELECT,
      });

      return result as unknown as MilestoneDetailOutput;
    } catch (error) {
      throw new MilestoneRepositoryError(
        'DATABASE_WRITE_FAILED',
        'Database write failed while creating milestone record.',
        error
      );
    }
  }

  public async findById(id: string, options?: QueryOptions): Promise<MilestoneDetailOutput | null> {
    try {
      const result = await this.prisma.milestone.findFirst({
        where: {
          id,
          deletedAt: options?.includeDeleted ? undefined : null,
        },
        select: MILESTONE_DETAIL_SELECT,
      });

      return result as unknown as MilestoneDetailOutput | null;
    } catch (error) {
      throw new MilestoneRepositoryError(
        'DATABASE_READ_FAILED',
        `Database read failed while fetching milestone by ID ${id}.`,
        error
      );
    }
  }

  public async findMany(
    options: FindMilestonesRepositoryOptions
  ): Promise<PaginatedMilestonesOutput> {
    try {
      const page = Math.max(1, options.pagination?.page ?? MILESTONE_PAGINATION.DEFAULT_PAGE);
      const rawLimit = options.pagination?.limit ?? MILESTONE_PAGINATION.DEFAULT_LIMIT;
      const limit = Math.min(MILESTONE_PAGINATION.MAX_LIMIT, Math.max(1, rawLimit));
      const skip = (page - 1) * limit;

      const where = this.buildWhereClause({
        search: options.search,
        status: options.status,
        projectId: options.projectId,
        includeDeleted: options.includeDeleted,
      });

      const orderBy = this.buildOrderBy(options.sortField, options.sortOrder);

      const [total, items] = await Promise.all([
        this.prisma.milestone.count({ where }),
        this.prisma.milestone.findMany({
          where,
          select: MILESTONE_BASE_SELECT,
          orderBy,
          skip,
          take: limit,
        }),
      ]);

      return {
        items: items as unknown as MilestoneDetailOutput[],
        total,
        page,
        limit,
      };
    } catch (error) {
      throw new MilestoneRepositoryError(
        'DATABASE_READ_FAILED',
        'Database read failed while listing milestones.',
        error
      );
    }
  }

  public async count(filters: MilestoneFiltersInput): Promise<number> {
    try {
      const where = this.buildWhereClause(filters);
      return await this.prisma.milestone.count({ where });
    } catch (error) {
      throw new MilestoneRepositoryError(
        'DATABASE_READ_FAILED',
        'Database read failed while counting milestones.',
        error
      );
    }
  }

  public async update(
    id: string,
    data: UpdateMilestoneRepositoryInput
  ): Promise<MilestoneDetailOutput | null> {
    try {
      const result = await this.prisma.milestone.update({
        where: { id },
        data: {
          title: data.title,
          description: data.description,
          status: data.status,
          dueDate: data.dueDate,
          completedAt: data.completedAt,
          updatedById: data.updatedById,
          deletedAt: data.deletedAt,
        },
        select: MILESTONE_DETAIL_SELECT,
      });

      return result as unknown as MilestoneDetailOutput;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return null;
      }
      throw new MilestoneRepositoryError(
        'DATABASE_UPDATE_FAILED',
        `Database update failed while updating milestone with ID ${id}.`,
        error
      );
    }
  }

  public async softDelete(id: string): Promise<boolean> {
    try {
      await this.prisma.milestone.update({
        where: { id },
        data: {
          deletedAt: new Date(),
        },
        select: { id: true },
      });
      return true;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return false;
      }
      throw new MilestoneRepositoryError(
        'DATABASE_DELETE_FAILED',
        `Database update failed while soft-deleting milestone with ID ${id}.`,
        error
      );
    }
  }

  public async restore(id: string): Promise<MilestoneDetailOutput> {
    try {
      const result = await this.prisma.milestone.update({
        where: { id },
        data: {
          deletedAt: null,
        },
        select: MILESTONE_DETAIL_SELECT,
      });
      return result as unknown as MilestoneDetailOutput;
    } catch (error) {
      throw new MilestoneRepositoryError(
        'DATABASE_UPDATE_FAILED',
        `Database update failed while restoring milestone with ID ${id}.`,
        error
      );
    }
  }

  public async existsByTitleInProject(title: string, projectId: string): Promise<boolean> {
    try {
      const count = await this.prisma.milestone.count({
        where: {
          title: { equals: title, mode: 'insensitive' },
          projectId,
          deletedAt: null,
        },
      });
      return count > 0;
    } catch (error) {
      throw new MilestoneRepositoryError(
        'DATABASE_READ_FAILED',
        `Database read failed while checking milestone existence for title ${title} in project ${projectId}.`,
        error
      );
    }
  }

  public async findByTitleInProject(
    title: string,
    projectId: string
  ): Promise<MilestoneDetailOutput | null> {
    try {
      const result = await this.prisma.milestone.findFirst({
        where: {
          title: { equals: title, mode: 'insensitive' },
          projectId,
          deletedAt: null,
        },
        select: MILESTONE_DETAIL_SELECT,
      });
      return result as unknown as MilestoneDetailOutput | null;
    } catch (error) {
      throw new MilestoneRepositoryError(
        'DATABASE_READ_FAILED',
        `Database read failed while fetching milestone by title ${title} in project ${projectId}.`,
        error
      );
    }
  }

  private buildWhereClause(filters: MilestoneFiltersInput): Prisma.MilestoneWhereInput {
    const where: Prisma.MilestoneWhereInput = {};

    if (!filters.includeDeleted) {
      where.deletedAt = null;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.projectId) {
      where.projectId = filters.projectId;
    }

    if (filters.search) {
      const searchTrim = filters.search.trim();
      where.OR = [
        { title: { contains: searchTrim, mode: 'insensitive' } },
        { description: { contains: searchTrim, mode: 'insensitive' } },
      ];
    }

    return where;
  }

  private buildOrderBy(
    sortField?: string,
    sortOrder?: 'asc' | 'desc'
  ): Prisma.MilestoneOrderByWithRelationInput {
    const field = sortField || MILESTONE_SORT.DEFAULT_FIELD;
    const order = sortOrder || MILESTONE_SORT.DEFAULT_ORDER;
    return { [field]: order };
  }
}
