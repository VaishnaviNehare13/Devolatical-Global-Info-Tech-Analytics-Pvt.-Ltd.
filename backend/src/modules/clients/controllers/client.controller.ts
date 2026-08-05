import { Request, Response, NextFunction } from 'express';
import { IClientService } from '../service/client.service.interface';
import { ClientMapper } from '../mappers/client.mapper';
import { CreateClientDto } from '../dto/create-client.dto';
import { UpdateClientDto } from '../dto/update-client.dto';
import { FindClientsDto } from '../dto/find-clients.dto';
import { HttpStatus } from '../../../constants/httpStatus';
import { AppError } from '../../../utils/appError';
import {
  ClientNotFoundError,
  ClientAlreadyExistsError,
  ClientArchivedError,
  InvalidStatusTransitionError,
  AccountManagerNotFoundError,
} from '../service/client.service.errors';

/**
 * Express Controller responsible for delegating client-specific HTTP endpoints
 * to the IClientService business layer.
 * Decoupled from service implementation details via interface constructor injection.
 */
export class ClientController {
  constructor(private readonly clientService: IClientService) {}

  /**
   * Creates a new client.
   */
  public createClient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto: CreateClientDto = req.body;
      const userId = req.user!.id;
      const result = await this.clientService.createClient(dto, userId);

      res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'Client created successfully.',
        data: ClientMapper.toDetailResponse(result),
      });
    } catch (error) {
      this.handleControllerError(error, next);
    }
  };

  /**
   * Retrieves a client by unique ID.
   */
  public getClientById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id;
      const result = await this.clientService.getClientById(id);

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Client details retrieved successfully.',
        data: ClientMapper.toDetailResponse(result),
      });
    } catch (error) {
      this.handleControllerError(error, next);
    }
  };

  /**
   * Retrieves a paginated list of clients matching filtering options.
   */
  public listClients = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = req.query as unknown as FindClientsDto;
      const result = await this.clientService.listClients({
        pagination:
          query.page && query.limit
            ? {
                page: query.page,
                limit: query.limit,
              }
            : undefined,
        search: query.search,
        status: query.status,
        accountManagerId: query.accountManagerId,
        includeDeleted: query.includeDeleted,
        sortField: query.sortField,
        sortOrder: query.sortOrder,
      });

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Clients list retrieved successfully.',
        data: ClientMapper.toPaginatedResponse(result),
      });
    } catch (error) {
      this.handleControllerError(error, next);
    }
  };

  /**
   * Updates an existing active client profile.
   */
  public updateClient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id;
      const dto: UpdateClientDto = req.body;
      const userId = req.user!.id;
      const result = await this.clientService.updateClient(id, dto, userId);

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Client updated successfully.',
        data: ClientMapper.toDetailResponse(result),
      });
    } catch (error) {
      this.handleControllerError(error, next);
    }
  };

  /**
   * Soft deletes / archives a client. Returns NO_CONTENT.
   */
  public archiveClient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id;
      const userId = req.user!.id;
      await this.clientService.archiveClient(id, userId);

      res.status(HttpStatus.NO_CONTENT).send();
    } catch (error) {
      this.handleControllerError(error, next);
    }
  };

  /**
   * Restores an archived client back to ACTIVE status.
   */
  public restoreClient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id;
      const userId = req.user!.id;
      const result = await this.clientService.restoreClient(id, userId);

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Client restored successfully.',
        data: ClientMapper.toDetailResponse(result),
      });
    } catch (error) {
      this.handleControllerError(error, next);
    }
  };

  /**
   * Helper to translate domain service exceptions into standard Express HTTP operational AppErrors.
   */
  private handleControllerError(error: unknown, next: NextFunction): void {
    if (error instanceof ClientNotFoundError) {
      next(new AppError(error.message, HttpStatus.NOT_FOUND));
    } else if (error instanceof ClientAlreadyExistsError) {
      next(new AppError(error.message, HttpStatus.CONFLICT));
    } else if (
      error instanceof ClientArchivedError ||
      error instanceof InvalidStatusTransitionError ||
      error instanceof AccountManagerNotFoundError
    ) {
      next(new AppError(error.message, HttpStatus.BAD_REQUEST));
    } else {
      next(error);
    }
  }
}
