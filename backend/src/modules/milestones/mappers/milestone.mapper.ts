import {
  MilestoneBaseOutput,
  MilestoneDetailOutput,
} from '../repository/milestone.repository.types';

export interface MilestoneSummaryResponse {
  id: string;
  title: string;
  status: string;
  reviewStatus: string;
  submittedForReviewAt: string | null;
  submittedById: string | null;
  approvedAt: string | null;
  approvedById: string | null;
  revisionNotes: string | null;
  projectId: string;
  dueDate: string | null;
  completedAt: string | null;
  createdAt: string;
}

export interface MilestoneDetailResponse extends MilestoneSummaryResponse {
  description: string | null;
  updatedAt: string;
}

export interface PaginatedMilestonesResponse {
  items: MilestoneSummaryResponse[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Pure Mapper responsible for transforming Milestones service outputs into API response structures.
 * Contains no business logic or framework-specific objects.
 */
export class MilestoneMapper {
  /**
   * Transforms a base milestone summary output into a presentation-safe response model.
   */
  public static toSummaryResponse(milestone: MilestoneBaseOutput): MilestoneSummaryResponse {
    return {
      id: milestone.id,
      title: milestone.title,
      status: milestone.status,
      reviewStatus: milestone.reviewStatus || 'NOT_SUBMITTED',
      submittedForReviewAt: milestone.submittedForReviewAt ? milestone.submittedForReviewAt.toISOString() : null,
      submittedById: milestone.submittedById || null,
      approvedAt: milestone.approvedAt ? milestone.approvedAt.toISOString() : null,
      approvedById: milestone.approvedById || null,
      revisionNotes: milestone.revisionNotes || null,
      projectId: milestone.projectId,
      dueDate: milestone.dueDate ? milestone.dueDate.toISOString() : null,
      completedAt: milestone.completedAt ? milestone.completedAt.toISOString() : null,
      createdAt: milestone.createdAt.toISOString(),
    };
  }

  /**
   * Transforms a detailed milestone output into a presentation-safe response model.
   * Excludes internal database properties (like deletedAt, createdById, updatedById).
   */
  public static toDetailResponse(milestone: MilestoneDetailOutput): MilestoneDetailResponse {
    return {
      id: milestone.id,
      title: milestone.title,
      status: milestone.status,
      reviewStatus: milestone.reviewStatus || 'NOT_SUBMITTED',
      submittedForReviewAt: milestone.submittedForReviewAt ? milestone.submittedForReviewAt.toISOString() : null,
      submittedById: milestone.submittedById || null,
      approvedAt: milestone.approvedAt ? milestone.approvedAt.toISOString() : null,
      approvedById: milestone.approvedById || null,
      revisionNotes: milestone.revisionNotes || null,
      projectId: milestone.projectId,
      dueDate: milestone.dueDate ? milestone.dueDate.toISOString() : null,
      completedAt: milestone.completedAt ? milestone.completedAt.toISOString() : null,
      createdAt: milestone.createdAt.toISOString(),
      description: milestone.description,
      updatedAt: milestone.updatedAt.toISOString(),
    };
  }

  /**
   * Transforms a paginated milestone list output into a presentation-safe response model.
   */
  public static toPaginatedResponse(paginated: {
    items: MilestoneBaseOutput[];
    total: number;
    page: number;
    limit: number;
  }): PaginatedMilestonesResponse {
    return {
      items: paginated.items.map((item) => this.toSummaryResponse(item)),
      total: paginated.total,
      page: paginated.page,
      limit: paginated.limit,
    };
  }
}
