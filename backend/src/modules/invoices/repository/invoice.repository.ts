import { PrismaClient, Prisma, Invoice, InvoiceStatus } from '@prisma/client';
import { CreateInvoiceInput, UpdateInvoiceInput, FindInvoicesInput } from '../dto/invoice.dto';

export interface PaginatedInvoicesOutput {
  items: Invoice[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export class InvoiceRepository {
  constructor(private readonly prisma: PrismaClient) {}

  public async create(data: CreateInvoiceInput & { createdById?: string }): Promise<Invoice> {
    return this.prisma.invoice.create({
      data: {
        invoiceNumber: data.invoiceNumber,
        description: data.description ?? null,
        amount: new Prisma.Decimal(data.amount),
        currency: data.currency || 'USD',
        status: data.status || InvoiceStatus.PENDING,
        dueDate: data.dueDate ?? null,
        clientId: data.clientId,
        projectId: data.projectId ?? null,
        createdById: data.createdById ?? null,
      },
      include: {
        client: { select: { id: true, name: true, code: true } },
        project: { select: { id: true, name: true, code: true } },
      },
    });
  }

  public async findById(id: string): Promise<Invoice | null> {
    return this.prisma.invoice.findFirst({
      where: { id, deletedAt: null },
      include: {
        client: { select: { id: true, name: true, code: true } },
        project: { select: { id: true, name: true, code: true } },
      },
    });
  }

  public async findMany(options: FindInvoicesInput): Promise<PaginatedInvoicesOutput> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.InvoiceWhereInput = {
      deletedAt: null,
    };

    if (options.status) {
      where.status = options.status;
    }
    if (options.clientId) {
      where.clientId = options.clientId;
    }
    if (options.projectId) {
      where.projectId = options.projectId;
    }
    if (options.search) {
      const searchTrim = options.search.trim();
      where.OR = [
        { invoiceNumber: { contains: searchTrim, mode: 'insensitive' } },
        { description: { contains: searchTrim, mode: 'insensitive' } },
      ];
    }

    const sortField = options.sortField || 'createdAt';
    const sortOrder = options.sortOrder || 'desc';

    const [total, items] = await Promise.all([
      this.prisma.invoice.count({ where }),
      this.prisma.invoice.findMany({
        where,
        include: {
          client: { select: { id: true, name: true, code: true } },
          project: { select: { id: true, name: true, code: true } },
        },
        orderBy: { [sortField]: sortOrder },
        skip,
        take: limit,
      }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit) || 1,
    };
  }

  public async update(id: string, data: UpdateInvoiceInput & { updatedById?: string }): Promise<Invoice | null> {
    const updateData: Prisma.InvoiceUpdateInput = {
      updatedBy: data.updatedById ? { connect: { id: data.updatedById } } : undefined,
    };

    if (data.description !== undefined) updateData.description = data.description;
    if (data.amount !== undefined) updateData.amount = new Prisma.Decimal(data.amount);
    if (data.currency !== undefined) updateData.currency = data.currency;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.dueDate !== undefined) updateData.dueDate = data.dueDate;
    if (data.paidAt !== undefined) updateData.paidAt = data.paidAt;

    try {
      return await this.prisma.invoice.update({
        where: { id },
        data: updateData,
        include: {
          client: { select: { id: true, name: true, code: true } },
          project: { select: { id: true, name: true, code: true } },
        },
      });
    } catch {
      return null;
    }
  }

  public async softDelete(id: string): Promise<boolean> {
    try {
      await this.prisma.invoice.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
      return true;
    } catch {
      return false;
    }
  }
}
