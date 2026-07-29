import {
  CreateClientRepositoryInput,
  UpdateClientRepositoryInput,
  ClientDetailOutput,
  FindClientsRepositoryOptions,
  ClientFiltersInput,
  PaginatedClientsOutput,
  QueryOptions,
} from './client.repository.types';

/**
 * Client Repository contract interface.
 * Defines query boundaries for managing client-specific persistent states.
 */
export interface IClientRepository {
  /**
   * Creates a new Client record.
   *
   * @param data Fields to create the client record
   * @returns Detailed client output
   */
  create(data: CreateClientRepositoryInput): Promise<ClientDetailOutput>;

  /**
   * Finds a client by unique ID. Excludes soft-deleted records by default.
   *
   * @param id The unique identifier of the client
   * @param options Query options (e.g. to include soft-deleted records)
   * @returns ClientDetailOutput or null if not found
   */
  findById(id: string, options?: QueryOptions): Promise<ClientDetailOutput | null>;

  /**
   * Finds a client by unique code. Excludes soft-deleted records by default.
   *
   * @param code The unique abbreviation code
   * @param options Query options (e.g. to include soft-deleted records)
   * @returns ClientDetailOutput or null if not found
   */
  findByCode(code: string, options?: QueryOptions): Promise<ClientDetailOutput | null>;

  /**
   * Finds, filters, and paginates client list. Excludes soft-deleted records by default.
   *
   * @param options Sorting, pagination, searching, and filtering options
   * @returns Paginated base client summaries with count metadata
   */
  findMany(options: FindClientsRepositoryOptions): Promise<PaginatedClientsOutput>;

  /**
   * Counts the clients matching filter criteria. Excludes soft-deleted records by default.
   *
   * @param filters Filtering options
   * @returns Total count of matching client records
   */
  count(filters: ClientFiltersInput): Promise<number>;

  /**
   * Updates an existing Client record.
   *
   * @param id The unique identifier of the client
   * @param data Fields to update
   * @returns Updated detailed client output or null if not found
   */
  update(id: string, data: UpdateClientRepositoryInput): Promise<ClientDetailOutput | null>;

  /**
   * Performs soft deletion of a client record. Marks deletedAt and sets status to ARCHIVED.
   *
   * @param id The unique identifier of the client
   * @returns Boolean indicating whether deletion succeeded
   */
  softDelete(id: string): Promise<boolean>;

  /**
   * Checks if a client with the given code exists. Includes soft-deleted records.
   *
   * @param code The client code
   * @returns Boolean indicating existence
   */
  existsByCode(code: string): Promise<boolean>;
}
