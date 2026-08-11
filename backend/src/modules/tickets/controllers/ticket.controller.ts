import { Request, Response, NextFunction } from 'express';
import { ITicketService } from '../service/ticket.service.interface';
import { TicketMapper } from '../mappers/ticket.mapper';
import { CreateTicketDto } from '../dto/create-ticket.dto';
import { UpdateTicketDto } from '../dto/update-ticket.dto';
import { FindTicketsDto } from '../dto/find-tickets.dto';
import { HttpStatus } from '../../../constants/httpStatus';
import { AppError } from '../../../utils/appError';
import {
  TicketNotFoundError,
  TicketArchivedError,
  InvalidStatusTransitionError,
  TicketAssigneeNotFoundError,
  ClientNotFoundError,
  ClientArchivedError,
  ProjectNotFoundError,
  ProjectArchivedError,
} from '../service/ticket.service.errors';

/**
 * Express Controller responsible for delegating ticket-specific HTTP endpoints
 * to the ITicketService business layer.
 * Decoupled from service implementation details via interface constructor injection.
 */
export class TicketController {
  constructor(private readonly ticketService: ITicketService) {}

  /**
   * Creates a new ticket.
   */
  public createTicket = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto: CreateTicketDto = req.body;
      const userId = req.user!.id;
      const result = await this.ticketService.createTicket(dto, userId);

      res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'Ticket created successfully.',
        data: TicketMapper.toDetailResponse(result),
      });
    } catch (error) {
      this.handleControllerError(error, next);
    }
  };

  /**
   * Retrieves a ticket by unique ID.
   */
  public getTicketById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id;
      const result = await this.ticketService.getTicketById(id);

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Ticket details retrieved successfully.',
        data: TicketMapper.toDetailResponse(result),
      });
    } catch (error) {
      this.handleControllerError(error, next);
    }
  };

  /**
   * Retrieves a paginated list of tickets matching filtering options.
   */
  public listTickets = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = req.query as unknown as FindTicketsDto;
      const result = await this.ticketService.listTickets({
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
        assignedToId: query.assignedToId,
        clientId: query.clientId,
        projectId: query.projectId,
        includeDeleted: query.includeDeleted,
        sortField: query.sortField,
        sortOrder: query.sortOrder,
      });

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Tickets list retrieved successfully.',
        data: TicketMapper.toPaginatedResponse(result),
      });
    } catch (error) {
      this.handleControllerError(error, next);
    }
  };

  /**
   * Updates an existing active ticket.
   */
  public updateTicket = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id;
      const dto: UpdateTicketDto = req.body;
      const userId = req.user!.id;
      const result = await this.ticketService.updateTicket(id, dto, userId);

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Ticket updated successfully.',
        data: TicketMapper.toDetailResponse(result),
      });
    } catch (error) {
      this.handleControllerError(error, next);
    }
  };

  /**
   * Soft deletes / archives a ticket. Returns NO_CONTENT.
   */
  public archiveTicket = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id;
      const userId = req.user!.id;
      await this.ticketService.archiveTicket(id, userId);

      res.status(HttpStatus.NO_CONTENT).send();
    } catch (error) {
      this.handleControllerError(error, next);
    }
  };

  /**
   * Restores an archived ticket back to active status.
   */
  public restoreTicket = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id;
      const userId = req.user!.id;
      const result = await this.ticketService.restoreTicket(id, userId);

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Ticket restored successfully.',
        data: TicketMapper.toDetailResponse(result),
      });
    } catch (error) {
      this.handleControllerError(error, next);
    }
  };

  /**
   * Helper to translate domain service exceptions into standard Express HTTP operational AppErrors.
   */
  private handleControllerError(error: unknown, next: NextFunction): void {
    if (error instanceof TicketNotFoundError) {
      next(new AppError(error.message, HttpStatus.NOT_FOUND));
    } else if (
      error instanceof TicketArchivedError ||
      error instanceof InvalidStatusTransitionError ||
      error instanceof TicketAssigneeNotFoundError ||
      error instanceof ClientNotFoundError ||
      error instanceof ClientArchivedError ||
      error instanceof ProjectNotFoundError ||
      error instanceof ProjectArchivedError
    ) {
      next(new AppError(error.message, HttpStatus.BAD_REQUEST));
    } else {
      next(error);
    }
  }
}
