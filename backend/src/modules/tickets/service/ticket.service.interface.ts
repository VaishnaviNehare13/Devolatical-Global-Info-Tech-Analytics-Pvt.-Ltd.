import {
  TicketDetailOutput,
  TicketCommentOutput,
  PaginatedTicketsOutput,
  TicketFiltersInput,
} from '../repository/ticket.repository.types';
import {
  CreateTicketServiceInput,
  UpdateTicketServiceInput,
  FindTicketsServiceOptions,
} from './ticket.service.types';

/**
 * Service Contract for managing Ticket business logic.
 * Encapsulates validations, audit tracking, and repository boundaries.
 */
export interface ITicketService {
  createTicket(data: CreateTicketServiceInput, currentUserId: string): Promise<TicketDetailOutput>;
  getTicketById(id: string): Promise<TicketDetailOutput>;
  listTickets(options: FindTicketsServiceOptions): Promise<PaginatedTicketsOutput>;
  updateTicket(
    id: string,
    data: UpdateTicketServiceInput,
    currentUserId: string
  ): Promise<TicketDetailOutput>;
  archiveTicket(id: string, currentUserId: string): Promise<TicketDetailOutput>;
  restoreTicket(id: string, currentUserId: string): Promise<TicketDetailOutput>;
  countTickets(filters: TicketFiltersInput): Promise<number>;
  addComment(
    ticketId: string,
    userId: string,
    message: string,
    isInternal?: boolean
  ): Promise<TicketCommentOutput>;
  getComments(
    ticketId: string,
    options?: { includeInternal?: boolean }
  ): Promise<TicketCommentOutput[]>;
}
