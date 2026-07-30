import {
  ClientDetailOutput,
  PaginatedClientsOutput,
  ClientFiltersInput,
} from '../repository/client.repository.types';
import {
  CreateClientServiceInput,
  UpdateClientServiceInput,
  FindClientsServiceOptions,
} from './client.service.types';

/**
 * Service Contract for managing Client business logic.
 * Encapsulates transactional orchestration, audit integration, and business validation.
 */
export interface IClientService {
  /**
   * Creates a new client record, validates unique constraints, and writes an audit log.
   *
   * @param data Payload to create a client
   * @param currentUserId The user creating the client
   * @returns Detailed client output
   */
  createClient(data: CreateClientServiceInput, currentUserId: string): Promise<ClientDetailOutput>;

  /**
   * Retrieves a client by unique ID. Excludes soft-deleted records by default.
   *
   * @param id The unique identifier of the client
   * @returns Detailed client output
   */
  getClientById(id: string): Promise<ClientDetailOutput>;

  /**
   * Retrieves a client by unique code. Excludes soft-deleted records by default.
   *
   * @param code The unique abbreviation code of the client
   * @returns Detailed client output
   */
  getClientByCode(code: string): Promise<ClientDetailOutput>;

  /**
   * Searches, filters, and paginates client summaries.
   *
   * @param options Query, filter, and pagination options
   * @returns Paginated results containing items and count metadata
   */
  listClients(options: FindClientsServiceOptions): Promise<PaginatedClientsOutput>;

  /**
   * Updates an existing active client profile and writes an audit log.
   *
   * @param id The unique identifier of the client to update
   * @param data Fields to update
   * @param currentUserId The user making the update
   * @returns Detailed updated client output
   */
  updateClient(
    id: string,
    data: UpdateClientServiceInput,
    currentUserId: string
  ): Promise<ClientDetailOutput>;

  /**
   * Soft deletes / archives a client, ensuring they are not already archived.
   *
   * @param id The unique identifier of the client to archive
   * @param currentUserId The user archiving the client
   * @returns Detailed updated client output
   */
  archiveClient(id: string, currentUserId: string): Promise<ClientDetailOutput>;

  /**
   * Restores a soft-deleted client back to ACTIVE status.
   *
   * @param id The unique identifier of the client to restore
   * @param currentUserId The user restoring the client
   * @returns Detailed updated client output
   */
  restoreClient(id: string, currentUserId: string): Promise<ClientDetailOutput>;

  /**
   * Counts the clients matching filter criteria.
   *
   * @param filters Filtering options
   * @returns Total count of matching client records
   */
  countClients(filters: ClientFiltersInput): Promise<number>;
}
