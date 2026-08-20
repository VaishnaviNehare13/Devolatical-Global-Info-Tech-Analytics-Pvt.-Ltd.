import { Request, Response, NextFunction } from 'express';
import { ClientPortalService } from '../services/client-portal.service';

export class ClientPortalController {
  constructor(private readonly clientPortalService: ClientPortalService) {}

  public getOverview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const userEmail = req.user!.email;
      const data = await this.clientPortalService.getOverview(userId, userEmail);
      res.status(200).json({
        success: true,
        message: 'Client overview retrieved successfully.',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  public getProjects = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const userEmail = req.user!.email;
      const data = await this.clientPortalService.getProjects(userId, userEmail);
      res.status(200).json({
        success: true,
        message: 'Client projects retrieved successfully.',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  public getInvoices = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const userEmail = req.user!.email;
      const data = await this.clientPortalService.getInvoices(userId, userEmail);
      res.status(200).json({
        success: true,
        message: 'Client invoices retrieved successfully.',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  public getTickets = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const userEmail = req.user!.email;
      const data = await this.clientPortalService.getTickets(userId, userEmail);
      res.status(200).json({
        success: true,
        message: 'Client tickets retrieved successfully.',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  public createTicket = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const userEmail = req.user!.email;
      const { subject, description, priority, projectId } = req.body;
      const ticket = await this.clientPortalService.createTicket(userId, userEmail, {
        subject,
        description,
        priority,
        projectId,
      });
      res.status(201).json({
        success: true,
        message: 'Support ticket submitted successfully.',
        data: ticket,
      });
    } catch (error) {
      next(error);
    }
  };

  public getTicketById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const userEmail = req.user!.email;
      const ticketId = req.params.id;
      const data = await this.clientPortalService.getTicketById(userId, userEmail, ticketId);
      res.status(200).json({
        success: true,
        message: 'Client ticket details retrieved successfully.',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  public createTicketComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const userEmail = req.user!.email;
      const ticketId = req.params.id;
      const { message } = req.body;
      const comment = await this.clientPortalService.addTicketComment(
        userId,
        userEmail,
        ticketId,
        message
      );
      res.status(201).json({
        success: true,
        message: 'Ticket comment posted successfully.',
        data: comment,
      });
    } catch (error) {
      next(error);
    }
  };

  public getDocuments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const userEmail = req.user!.email;
      const data = await this.clientPortalService.getDocuments(userId, userEmail);
      res.status(200).json({
        success: true,
        message: 'Client documents retrieved successfully.',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  public downloadDocument = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const userEmail = req.user!.email;
      const documentId = req.params.id;
      const { document, absolutePath } = await this.clientPortalService.getDocumentForDownload(
        userId,
        userEmail,
        documentId
      );

      res.setHeader('Content-Type', document.mimeType);
      res.download(absolutePath, document.fileName, (err) => {
        if (err && !res.headersSent) {
          next(err);
        }
      });
    } catch (error) {
      next(error);
    }
  };
}
