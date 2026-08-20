import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { ICareerService } from '../services/career.service.interface';
import { CareerMapper } from '../mappers/career.mapper';
import { findJobsSchema } from '../dto/find-jobs.dto';
import { createJobSchema } from '../dto/create-job.dto';
import { updateJobSchema } from '../dto/update-job.dto';
import { createApplicationSchema } from '../dto/create-application.dto';
import { updateApplicationSchema } from '../dto/update-application.dto';
import { findApplicationsSchema } from '../dto/find-applications.dto';
import { AppError } from '../../../utils/appError';

export class CareerController {
  constructor(private careerService: ICareerService) {}

  // Public Endpoints
  public getPublicJobs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = findJobsSchema.parse({
        ...req.query,
        status: 'ACTIVE',
        includeDeleted: 'false',
      });

      const result = await this.careerService.getJobs(query);
      const publicItems = result.items.map((job) => CareerMapper.toPublicJobResponse(job));

      res.status(200).json({
        success: true,
        data: {
          items: publicItems,
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: Math.ceil(result.total / result.limit) || 1,
        },
      });
    } catch (err) {
      next(err);
    }
  };

  public getPublicJobById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const job = await this.careerService.getJobById(id, false);

      if (job.status !== 'ACTIVE') {
        throw new AppError(`Job posting with ID "${id}" is not active.`, 404);
      }

      res.status(200).json({
        success: true,
        data: CareerMapper.toPublicJobResponse(job),
      });
    } catch (err) {
      next(err);
    }
  };

  public submitApplication = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const jobId = req.params.jobId as string;
      const parsedBody = createApplicationSchema.parse(req.body);

      let resumeData: {
        resumeFileName: string;
        resumeFileUrl: string;
        resumeMimeType: string;
        resumeFileSize: number;
      } | undefined;

      if (req.file) {
        resumeData = {
          resumeFileName: req.file.originalname,
          resumeFileUrl: `/api/v1/careers/applications/file/${req.file.filename}`,
          resumeMimeType: req.file.mimetype,
          resumeFileSize: req.file.size,
        };
      }

      const application = await this.careerService.submitApplication(jobId, parsedBody, resumeData);

      res.status(201).json({
        success: true,
        data: CareerMapper.toPublicApplicationResponse(application),
        message: 'Job application submitted successfully.',
      });
    } catch (err) {
      next(err);
    }
  };

  // Admin Endpoints
  public getAdminJobs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = findJobsSchema.parse(req.query);
      const result = await this.careerService.getJobs(query);
      const adminItems = result.items.map((job) => CareerMapper.toAdminJobResponse(job));

      res.status(200).json({
        success: true,
        data: {
          items: adminItems,
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: Math.ceil(result.total / result.limit) || 1,
        },
      });
    } catch (err) {
      next(err);
    }
  };

  public createAdminJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsedBody = createJobSchema.parse(req.body);
      const currentUserId = (req as any).user?.id;
      const job = await this.careerService.createJob(parsedBody, currentUserId);

      res.status(201).json({
        success: true,
        data: CareerMapper.toAdminJobResponse(job),
        message: 'Job posting created successfully.',
      });
    } catch (err) {
      next(err);
    }
  };

  public updateAdminJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const parsedBody = updateJobSchema.parse(req.body);
      const currentUserId = (req as any).user?.id;
      const job = await this.careerService.updateJob(id, parsedBody, currentUserId);

      res.status(200).json({
        success: true,
        data: CareerMapper.toAdminJobResponse(job),
        message: 'Job posting updated successfully.',
      });
    } catch (err) {
      next(err);
    }
  };

  public archiveAdminJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const currentUserId = (req as any).user?.id;
      await this.careerService.archiveJob(id, currentUserId);

      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };

  public getAdminApplications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = findApplicationsSchema.parse(req.query);
      const result = await this.careerService.getApplications(query);
      const adminItems = result.items.map((app) => CareerMapper.toAdminApplicationResponse(app));

      res.status(200).json({
        success: true,
        data: {
          items: adminItems,
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: Math.ceil(result.total / result.limit) || 1,
        },
      });
    } catch (err) {
      next(err);
    }
  };

  public getAdminApplicationById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const application = await this.careerService.getApplicationById(id, true);

      res.status(200).json({
        success: true,
        data: CareerMapper.toAdminApplicationResponse(application),
      });
    } catch (err) {
      next(err);
    }
  };

  public updateAdminApplication = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const parsedBody = updateApplicationSchema.parse(req.body);
      const currentUserId = (req as any).user?.id;
      const updated = await this.careerService.updateApplication(id, parsedBody, currentUserId);

      res.status(200).json({
        success: true,
        data: CareerMapper.toAdminApplicationResponse(updated),
        message: 'Job application status updated successfully.',
      });
    } catch (err) {
      next(err);
    }
  };

  public archiveAdminApplication = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const currentUserId = (req as any).user?.id;
      await this.careerService.archiveApplication(id, currentUserId);

      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };

  public downloadResumeFile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filename = req.params.filename as string;
      const safeFilename = path.basename(filename);
      const filePath = path.join(process.cwd(), 'uploads', 'resumes', safeFilename);

      if (!fs.existsSync(filePath)) {
        throw new AppError('Resume file not found on server.', 404);
      }

      res.sendFile(filePath);
    } catch (err) {
      next(err);
    }
  };
}
