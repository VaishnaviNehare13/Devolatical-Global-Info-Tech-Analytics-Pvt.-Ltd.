import { Request, Response, NextFunction } from 'express';
import { AuditLogService } from '../service/audit-log.service';
import { FindAuditLogQueryDto } from '../dto/find-audit-log.dto';
import { AuditLogParamDto } from '../dto/audit-log-param.dto';
import { AUDIT_LOG_MESSAGES } from '../constants/audit-log.constants';
import { HttpStatus } from '../../../constants/httpStatus';
import { AppError } from '../../../utils/appError';
import {
  AuditLogNotFoundError,
  AuditLogValidationError,
  AuditLogServiceError,
} from '../service/audit-log.service.errors';

/**
 * Express Controller responsible for delegating HTTP endpoints to the AuditLogService.
 * Decoupled from service details via constructor dependency injection.
 */
export class AuditLogController {
  constructor(private readonly service: AuditLogService) {}

  /**
   * Searches, filters, and paginates audit logs list.
   * Access restricted to authorized administrative roles.
   */
  public getAuditLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = req.query as unknown as FindAuditLogQueryDto;

      const options = {
        pagination: {
          page: query.page,
          limit: query.limit,
        },
        search: query.search,
        filters: {
          module: query.module,
          action: query.action,
          status: query.status,
          severity: query.severity,
          userId: query.userId,
          requestId: query.requestId,
          entityType: query.entityType,
          entityId: query.entityId,
          resourceName: query.resourceName,
          dateFrom: query.dateFrom,
          dateTo: query.dateTo,
        },
        sorting: query.sortField
          ? {
              field: query.sortField,
              order: query.sortOrder || 'desc',
            }
          : undefined,
      };

      const result = await this.service.getAuditLogs(options);

      res.status(HttpStatus.OK).json({
        success: true,
        message: AUDIT_LOG_MESSAGES.RETRIEVE_LIST_SUCCESS,
        data: result,
      });
    } catch (error) {
      this.handleServiceError(error, next);
    }
  };

  /**
   * Retrieves detail logs of a single audit record by ID.
   * Access restricted to authorized administrative roles.
   */
  public getAuditLogById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params as unknown as AuditLogParamDto;
      const result = await this.service.getAuditLogById(id);

      res.status(HttpStatus.OK).json({
        success: true,
        message: AUDIT_LOG_MESSAGES.RETRIEVE_DETAIL_SUCCESS,
        data: result,
      });
    } catch (error) {
      this.handleServiceError(error, next);
    }
  };

  /**
   * Helper to translate domain/service exceptions into standard Express HTTP operational AppErrors.
   */
  private handleServiceError(error: unknown, next: NextFunction): void {
    if (error instanceof AuditLogNotFoundError) {
      next(new AppError(error.message, HttpStatus.NOT_FOUND));
    } else if (error instanceof AuditLogValidationError) {
      next(new AppError(error.message, HttpStatus.BAD_REQUEST));
    } else if (error instanceof AuditLogServiceError) {
      next(new AppError(error.message, HttpStatus.INTERNAL_SERVER_ERROR));
    } else {
      next(error);
    }
  }
}
