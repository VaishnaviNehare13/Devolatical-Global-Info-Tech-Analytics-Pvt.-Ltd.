import { PrismaClient, Prisma } from '@prisma/client';
import { JobOutput, JobApplicationOutput } from '../careers.types';
import { CreateJobDTO } from '../dto/create-job.dto';
import { UpdateJobDTO } from '../dto/update-job.dto';
import { FindJobsDTO } from '../dto/find-jobs.dto';
import { CreateApplicationDTO } from '../dto/create-application.dto';
import { UpdateApplicationDTO } from '../dto/update-application.dto';
import { FindApplicationsDTO } from '../dto/find-applications.dto';

export class CareerRepository {
  constructor(private prisma: PrismaClient) {}

  // Job operations
  public async createJob(data: CreateJobDTO, currentUserId?: string): Promise<JobOutput> {
    return this.prisma.job.create({
      data: {
        ...data,
        createdById: currentUserId || null,
      },
      include: {
        _count: {
          select: { applications: true },
        },
      },
    });
  }

  public async findJobById(id: string, includeDeleted = false): Promise<JobOutput | null> {
    const where: Prisma.JobWhereInput = { id };
    if (!includeDeleted) {
      where.deletedAt = null;
    }

    return this.prisma.job.findFirst({
      where,
      include: {
        _count: {
          select: { applications: true },
        },
      },
    });
  }

  public async findJobs(params: FindJobsDTO): Promise<{ items: JobOutput[]; total: number }> {
    const { page, limit, search, department, employmentType, status, includeDeleted, sortField, sortOrder } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.JobWhereInput = {};
    if (!includeDeleted) {
      where.deletedAt = null;
    }
    if (status) {
      where.status = status;
    }
    if (department) {
      where.department = { contains: department, mode: 'insensitive' };
    }
    if (employmentType) {
      where.employmentType = employmentType;
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { department: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.job.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortField]: sortOrder },
        include: {
          _count: {
            select: { applications: true },
          },
        },
      }),
      this.prisma.job.count({ where }),
    ]);

    return { items, total };
  }

  public async updateJob(id: string, data: UpdateJobDTO, currentUserId?: string): Promise<JobOutput> {
    return this.prisma.job.update({
      where: { id },
      data: {
        ...data,
        updatedById: currentUserId || null,
      },
      include: {
        _count: {
          select: { applications: true },
        },
      },
    });
  }

  public async archiveJob(id: string): Promise<void> {
    await this.prisma.job.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'CLOSED' },
    });
  }

  // Job Application operations
  public async createApplication(
    jobId: string,
    data: CreateApplicationDTO,
    resumeData?: {
      resumeFileName: string;
      resumeFileUrl: string;
      resumeMimeType: string;
      resumeFileSize: number;
    }
  ): Promise<JobApplicationOutput> {
    return this.prisma.jobApplication.create({
      data: {
        jobId,
        applicantName: data.applicantName,
        email: data.email,
        phone: data.phone || null,
        portfolioUrl: data.portfolioUrl || null,
        coverMessage: data.coverMessage || null,
        resumeFileName: resumeData?.resumeFileName || null,
        resumeFileUrl: resumeData?.resumeFileUrl || null,
        resumeMimeType: resumeData?.resumeMimeType || null,
        resumeFileSize: resumeData?.resumeFileSize || null,
      },
      include: {
        job: true,
      },
    });
  }

  public async findApplicationById(id: string, includeDeleted = false): Promise<JobApplicationOutput | null> {
    const where: Prisma.JobApplicationWhereInput = { id };
    if (!includeDeleted) {
      where.deletedAt = null;
    }

    return this.prisma.jobApplication.findFirst({
      where,
      include: {
        job: true,
      },
    });
  }

  public async findApplications(params: FindApplicationsDTO): Promise<{ items: JobApplicationOutput[]; total: number }> {
    const { page, limit, search, jobId, status, includeDeleted, sortField, sortOrder } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.JobApplicationWhereInput = {};
    if (!includeDeleted) {
      where.deletedAt = null;
    }
    if (jobId) {
      where.jobId = jobId;
    }
    if (status) {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { applicantName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { coverMessage: { contains: search, mode: 'insensitive' } },
        { job: { title: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.jobApplication.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortField]: sortOrder },
        include: {
          job: true,
        },
      }),
      this.prisma.jobApplication.count({ where }),
    ]);

    return { items, total };
  }

  public async updateApplication(id: string, data: UpdateApplicationDTO, currentUserId?: string): Promise<JobApplicationOutput> {
    const updateData: Prisma.JobApplicationUpdateInput = {
      ...data,
    };
    if (data.status) {
      updateData.reviewedAt = new Date();
      if (currentUserId) {
        updateData.reviewedBy = { connect: { id: currentUserId } };
      }
    }

    return this.prisma.jobApplication.update({
      where: { id },
      data: updateData,
      include: {
        job: true,
      },
    });
  }

  public async archiveApplication(id: string): Promise<void> {
    await this.prisma.jobApplication.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
