import { ICareerService } from './career.service.interface';
import { CareerRepository } from '../repositories/career.repository';
import { JobOutput, JobApplicationOutput, JobStatus } from '../careers.types';
import { CreateJobDTO } from '../dto/create-job.dto';
import { UpdateJobDTO } from '../dto/update-job.dto';
import { FindJobsDTO } from '../dto/find-jobs.dto';
import { CreateApplicationDTO } from '../dto/create-application.dto';
import { UpdateApplicationDTO } from '../dto/update-application.dto';
import { FindApplicationsDTO } from '../dto/find-applications.dto';
import { AppError } from '../../../utils/appError';
import { AuditLogService } from '../../audit-logs/service/audit-log.service';
import { AuditModule, AuditAction, AuditStatus, AuditSeverity } from '@prisma/client';

export class CareerService implements ICareerService {
  constructor(
    private careerRepository: CareerRepository,
    private auditLogService?: AuditLogService
  ) {}

  public async createJob(data: CreateJobDTO, currentUserId?: string): Promise<JobOutput> {
    const job = await this.careerRepository.createJob(data, currentUserId);

    if (this.auditLogService && currentUserId) {
      await this.auditLogService.record({
        userId: currentUserId,
        module: AuditModule.SYSTEM,
        action: AuditAction.CREATE,
        entityType: 'Job',
        entityId: job.id,
        resourceName: job.title,
        newValues: data as any,
        status: AuditStatus.SUCCESS,
        severity: AuditSeverity.INFO,
      }).catch(() => {});
    }

    return job;
  }

  public async getJobById(id: string, includeDeleted = false): Promise<JobOutput> {
    const job = await this.careerRepository.findJobById(id, includeDeleted);
    if (!job) {
      throw new AppError(`Job posting with ID "${id}" was not found.`, 404);
    }
    return job;
  }

  public async getJobs(params: FindJobsDTO): Promise<{ items: JobOutput[]; total: number; page: number; limit: number }> {
    const { items, total } = await this.careerRepository.findJobs(params);
    return {
      items,
      total,
      page: params.page,
      limit: params.limit,
    };
  }

  public async updateJob(id: string, data: UpdateJobDTO, currentUserId?: string): Promise<JobOutput> {
    const existing = await this.getJobById(id, true);
    const updated = await this.careerRepository.updateJob(id, data, currentUserId);

    if (this.auditLogService && currentUserId) {
      await this.auditLogService.record({
        userId: currentUserId,
        module: AuditModule.SYSTEM,
        action: AuditAction.UPDATE,
        entityType: 'Job',
        entityId: id,
        resourceName: updated.title,
        oldValues: existing as any,
        newValues: data as any,
        status: AuditStatus.SUCCESS,
        severity: AuditSeverity.INFO,
      }).catch(() => {});
    }

    return updated;
  }

  public async archiveJob(id: string, currentUserId?: string): Promise<void> {
    const existing = await this.getJobById(id, false);
    await this.careerRepository.archiveJob(id);

    if (this.auditLogService && currentUserId) {
      await this.auditLogService.record({
        userId: currentUserId,
        module: AuditModule.SYSTEM,
        action: AuditAction.DELETE,
        entityType: 'Job',
        entityId: id,
        resourceName: existing.title,
        status: AuditStatus.SUCCESS,
        severity: AuditSeverity.WARNING,
      }).catch(() => {});
    }
  }

  // Application operations
  public async submitApplication(
    jobId: string,
    data: CreateApplicationDTO,
    resumeData?: {
      resumeFileName: string;
      resumeFileUrl: string;
      resumeMimeType: string;
      resumeFileSize: number;
    }
  ): Promise<JobApplicationOutput> {
    const job = await this.careerRepository.findJobById(jobId, false);
    if (!job) {
      throw new AppError(`Target job posting with ID "${jobId}" was not found.`, 404);
    }

    if (job.status !== JobStatus.ACTIVE) {
      throw new AppError(`Job posting "${job.title}" is currently not accepting applications.`, 400);
    }

    const application = await this.careerRepository.createApplication(jobId, data, resumeData);

    return application;
  }

  public async getApplicationById(id: string, includeDeleted = false): Promise<JobApplicationOutput> {
    const application = await this.careerRepository.findApplicationById(id, includeDeleted);
    if (!application) {
      throw new AppError(`Job application with ID "${id}" was not found.`, 404);
    }
    return application;
  }

  public async getApplications(
    params: FindApplicationsDTO
  ): Promise<{ items: JobApplicationOutput[]; total: number; page: number; limit: number }> {
    const { items, total } = await this.careerRepository.findApplications(params);
    return {
      items,
      total,
      page: params.page,
      limit: params.limit,
    };
  }

  public async updateApplication(
    id: string,
    data: UpdateApplicationDTO,
    currentUserId?: string
  ): Promise<JobApplicationOutput> {
    const existing = await this.getApplicationById(id, true);
    const updated = await this.careerRepository.updateApplication(id, data, currentUserId);

    if (this.auditLogService && currentUserId) {
      await this.auditLogService.record({
        userId: currentUserId,
        module: AuditModule.SYSTEM,
        action: AuditAction.UPDATE,
        entityType: 'JobApplication',
        entityId: id,
        resourceName: `${updated.applicantName} - ${updated.job?.title || 'Job Application'}`,
        oldValues: existing as any,
        newValues: data as any,
        status: AuditStatus.SUCCESS,
        severity: AuditSeverity.INFO,
      }).catch(() => {});
    }

    return updated;
  }

  public async archiveApplication(id: string, currentUserId?: string): Promise<void> {
    const existing = await this.getApplicationById(id, false);
    await this.careerRepository.archiveApplication(id);

    if (this.auditLogService && currentUserId) {
      await this.auditLogService.record({
        userId: currentUserId,
        module: AuditModule.SYSTEM,
        action: AuditAction.DELETE,
        entityType: 'JobApplication',
        entityId: id,
        resourceName: `${existing.applicantName} - Application`,
        status: AuditStatus.SUCCESS,
        severity: AuditSeverity.WARNING,
      }).catch(() => {});
    }
  }
}
