import { Request, Response, NextFunction } from 'express';
import { InvoiceService } from '../service/invoice.service';
import { CreateInvoiceInput, UpdateInvoiceInput, FindInvoicesInput } from '../dto/invoice.dto';
import { generateInvoicePdf } from '../utils/invoice-pdf.generator';

export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  public listInvoices = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const queryParams = req.query as unknown as FindInvoicesInput;
      const result = await this.invoiceService.listInvoices(queryParams);
      res.status(200).json({
        success: true,
        message: 'Invoices retrieved successfully.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  public getInvoiceById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const invoice = await this.invoiceService.getInvoiceById(id);
      res.status(200).json({
        success: true,
        message: 'Invoice retrieved successfully.',
        data: invoice,
      });
    } catch (error) {
      next(error);
    }
  };

  public downloadInvoicePdf = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const invoice = await this.invoiceService.getInvoiceById(id);
      const pdfBuffer = await generateInvoicePdf(invoice);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="Invoice-${invoice.invoiceNumber}.pdf"`);
      res.status(200).send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  };

  public createInvoice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = req.body as CreateInvoiceInput;
      const currentUserId = req.user?.id;
      const invoice = await this.invoiceService.createInvoice(body, currentUserId);
      res.status(201).json({
        success: true,
        message: 'Invoice created successfully.',
        data: invoice,
      });
    } catch (error) {
      next(error);
    }
  };

  public updateInvoice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const body = req.body as UpdateInvoiceInput;
      const currentUserId = req.user?.id;
      const invoice = await this.invoiceService.updateInvoice(id, body, currentUserId);
      res.status(200).json({
        success: true,
        message: 'Invoice updated successfully.',
        data: invoice,
      });
    } catch (error) {
      next(error);
    }
  };

  public deleteInvoice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.invoiceService.deleteInvoice(id);
      res.status(200).json({
        success: true,
        message: 'Invoice deleted successfully.',
        data: null,
      });
    } catch (error) {
      next(error);
    }
  };
}
