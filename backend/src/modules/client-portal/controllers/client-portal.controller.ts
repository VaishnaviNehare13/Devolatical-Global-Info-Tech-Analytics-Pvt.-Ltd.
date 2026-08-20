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
}
