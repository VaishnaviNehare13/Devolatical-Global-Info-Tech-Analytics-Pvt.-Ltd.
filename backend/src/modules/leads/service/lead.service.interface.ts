import {
  LeadDetailOutput,
  PaginatedLeadsOutput,
  LeadFiltersInput,
} from '../repository/lead.repository.types';
import {
  CreateLeadServiceInput,
  UpdateLeadServiceInput,
  FindLeadsServiceOptions,
} from './lead.service.types';

/**
 * Service Contract for managing Lead business logic.
 * Encapsulates validations, audit tracking, and repository boundaries.
 */
export interface ILeadService {
  createLead(data: CreateLeadServiceInput, currentUserId?: string): Promise<LeadDetailOutput>;
  getLeadById(id: string): Promise<LeadDetailOutput>;
  getLeadByEmail(email: string): Promise<LeadDetailOutput>;
  listLeads(options: FindLeadsServiceOptions): Promise<PaginatedLeadsOutput>;
  updateLead(
    id: string,
    data: UpdateLeadServiceInput,
    currentUserId: string
  ): Promise<LeadDetailOutput>;
  archiveLead(id: string, currentUserId: string): Promise<LeadDetailOutput>;
  restoreLead(id: string, currentUserId: string): Promise<LeadDetailOutput>;
  countLeads(filters: LeadFiltersInput): Promise<number>;
  approveLeadAndProvisionClient(
    leadId: string,
    currentUserId: string,
    password?: string
  ): Promise<{
    lead: LeadDetailOutput;
    user: { id: string; email: string; displayName: string };
    client: { id: string; name: string; code: string };
    initialPassword: string;
  }>;
}
