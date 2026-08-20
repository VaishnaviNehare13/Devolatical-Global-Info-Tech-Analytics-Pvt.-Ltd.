import { Invoice } from '@prisma/client';
import { InvoiceRepository, PaginatedInvoicesOutput } from '../repository/invoice.repository';
import { CreateInvoiceInput, UpdateInvoiceInput, FindInvoicesInput } from '../dto/invoice.dto';

export class InvoiceService {
  constructor(private readonly invoiceRepository: InvoiceRepository) {}

  public async createInvoice(data: CreateInvoiceInput, currentUserId?: string): Promise<Invoice> {
    return this.invoiceRepository.create({
      ...data,
      createdById: currentUserId,
    });
  }

  public async getInvoiceById(id: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findById(id);
    if (!invoice) {
      throw new Error(`Invoice with ID '${id}' not found.`);
    }
    return invoice;
  }

  public async listInvoices(options: FindInvoicesInput): Promise<PaginatedInvoicesOutput> {
    return this.invoiceRepository.findMany(options);
  }

  public async updateInvoice(id: string, data: UpdateInvoiceInput, currentUserId?: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findById(id);
    if (!invoice) {
      throw new Error(`Invoice with ID '${id}' not found.`);
    }
    const updated = await this.invoiceRepository.update(id, {
      ...data,
      updatedById: currentUserId,
    });
    if (!updated) {
      throw new Error(`Failed to update invoice '${id}'.`);
    }
    return updated;
  }

  public async deleteInvoice(id: string): Promise<void> {
    const deleted = await this.invoiceRepository.softDelete(id);
    if (!deleted) {
      throw new Error(`Failed to delete invoice '${id}'.`);
    }
  }
}
