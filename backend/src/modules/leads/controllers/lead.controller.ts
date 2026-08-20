import { Request, Response, NextFunction } from 'express';
import { ILeadService } from '../service/lead.service.interface';
import { LeadMapper } from '../mappers/lead.mapper';
import { CreateLeadDto } from '../dto/create-lead.dto';
import { UpdateLeadDto } from '../dto/update-lead.dto';
import { FindLeadsDto } from '../dto/find-leads.dto';
import { HttpStatus } from '../../../constants/httpStatus';
import { AppError } from '../../../utils/appError';
import {
  LeadNotFoundError,
  LeadArchivedError,
  InvalidStatusTransitionError,
  LeadAssigneeNotFoundError,
} from '../service/lead.service.errors';

/**
 * Express Controller responsible for delegating lead-specific HTTP endpoints
 * to the ILeadService business layer.
 * Decoupled from service implementation details via interface constructor injection.
 */
export class LeadController {
  constructor(private readonly leadService: ILeadService) {}

  /**
   * Creates a new lead.
   */
  public createLead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto: CreateLeadDto = req.body;
      const userId = req.user?.id;
      const result = await this.leadService.createLead(dto, userId);

      res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'Lead created successfully.',
        data: LeadMapper.toDetailResponse(result),
      });
    } catch (error) {
      this.handleControllerError(error, next);
    }
  };

  /**
   * Retrieves a lead by unique ID.
   */
  public getLeadById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id;
      const result = await this.leadService.getLeadById(id);

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Lead details retrieved successfully.',
        data: LeadMapper.toDetailResponse(result),
      });
    } catch (error) {
      this.handleControllerError(error, next);
    }
  };

  /**
   * Retrieves a paginated list of leads matching filtering options.
   */
  public listLeads = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = req.query as unknown as FindLeadsDto;
      const result = await this.leadService.listLeads({
        pagination:
          query.page && query.limit
            ? {
                page: query.page,
                limit: query.limit,
              }
            : undefined,
        search: query.search,
        status: query.status,
        priority: query.priority,
        source: query.source,
        assignedToId: query.assignedToId,
        includeDeleted: query.includeDeleted,
        sortField: query.sortField,
        sortOrder: query.sortOrder,
      });

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Leads list retrieved successfully.',
        data: LeadMapper.toPaginatedResponse(result),
      });
    } catch (error) {
      this.handleControllerError(error, next);
    }
  };

  /**
   * Updates an existing active lead profile.
   */
  public updateLead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id;
      const dto: UpdateLeadDto = req.body;
      const userId = req.user!.id;
      const result = await this.leadService.updateLead(id, dto, userId);

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Lead updated successfully.',
        data: LeadMapper.toDetailResponse(result),
      });
    } catch (error) {
      this.handleControllerError(error, next);
    }
  };

  /**
   * Soft deletes / archives a lead. Returns NO_CONTENT.
   */
  public archiveLead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id;
      const userId = req.user!.id;
      await this.leadService.archiveLead(id, userId);

      res.status(HttpStatus.NO_CONTENT).send();
    } catch (error) {
      this.handleControllerError(error, next);
    }
  };

  /**
   * Restores an archived lead back to active status.
   */
  public restoreLead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id;
      const userId = req.user!.id;
      const result = await this.leadService.restoreLead(id, userId);

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Lead restored successfully.',
        data: LeadMapper.toDetailResponse(result),
      });
    } catch (error) {
      this.handleControllerError(error, next);
    }
  };

  /**
   * Approves a lead and provisions a Client User and Client Organization.
   */
  public approveLead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id;
      const userId = req.user!.id;
      const password = req.body.password;
      const result = await (this.leadService as any).approveLeadAndProvisionClient(id, userId, password);

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Lead approved and Client Portal account provisioned successfully.',
        data: result,
      });
    } catch (error) {
      this.handleControllerError(error, next);
    }
  };

  /**
   * Helper to translate domain service exceptions into standard Express HTTP operational AppErrors.
   */
  private handleControllerError(error: unknown, next: NextFunction): void {
    if (error instanceof LeadNotFoundError) {
      next(new AppError(error.message, HttpStatus.NOT_FOUND));
    } else if (
      error instanceof LeadArchivedError ||
      error instanceof InvalidStatusTransitionError ||
      error instanceof LeadAssigneeNotFoundError
    ) {
      next(new AppError(error.message, HttpStatus.BAD_REQUEST));
    } else {
      next(error);
    }
  }
}
