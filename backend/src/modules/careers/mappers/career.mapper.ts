import { JobOutput, JobApplicationOutput } from '../careers.types';

export interface PublicJobResponse {
  id: string;
  title: string;
  department: string;
  location: string;
  employmentType: string;
  salaryRange: string | null;
  description: string;
  requirements: string | null;
  status: string;
  createdAt: string;
}

export interface PublicApplicationResponse {
  id: string;
  jobId: string;
  applicantName: string;
  email: string;
  status: string;
  createdAt: string;
}

export interface AdminJobResponse extends PublicJobResponse {
  updatedAt: string;
  deletedAt: string | null;
  applicationsCount: number;
}

export interface AdminApplicationResponse extends PublicApplicationResponse {
  phone: string | null;
  portfolioUrl: string | null;
  coverMessage: string | null;
  resumeFileName: string | null;
  resumeFileUrl: string | null;
  resumeMimeType: string | null;
  resumeFileSize: number | null;
  notes: string | null;
  updatedAt: string;
  reviewedAt: string | null;
  reviewedById: string | null;
  deletedAt: string | null;
  job?: PublicJobResponse;
}

export class CareerMapper {
  public static toPublicJobResponse(job: JobOutput): PublicJobResponse {
    return {
      id: job.id,
      title: job.title,
      department: job.department,
      location: job.location,
      employmentType: job.employmentType,
      salaryRange: job.salaryRange,
      description: job.description,
      requirements: job.requirements,
      status: job.status,
      createdAt: job.createdAt.toISOString(),
    };
  }

  public static toAdminJobResponse(job: JobOutput): AdminJobResponse {
    return {
      ...this.toPublicJobResponse(job),
      updatedAt: job.updatedAt.toISOString(),
      deletedAt: job.deletedAt ? job.deletedAt.toISOString() : null,
      applicationsCount: job._count?.applications ?? 0,
    };
  }

  public static toPublicApplicationResponse(app: JobApplicationOutput): PublicApplicationResponse {
    return {
      id: app.id,
      jobId: app.jobId,
      applicantName: app.applicantName,
      email: app.email,
      status: app.status,
      createdAt: app.createdAt.toISOString(),
    };
  }

  public static toAdminApplicationResponse(app: JobApplicationOutput): AdminApplicationResponse {
    return {
      id: app.id,
      jobId: app.jobId,
      applicantName: app.applicantName,
      email: app.email,
      phone: app.phone,
      portfolioUrl: app.portfolioUrl,
      coverMessage: app.coverMessage,
      resumeFileName: app.resumeFileName,
      resumeFileUrl: app.resumeFileUrl,
      resumeMimeType: app.resumeMimeType,
      resumeFileSize: app.resumeFileSize,
      status: app.status,
      notes: app.notes,
      createdAt: app.createdAt.toISOString(),
      updatedAt: app.updatedAt.toISOString(),
      reviewedAt: app.reviewedAt ? app.reviewedAt.toISOString() : null,
      reviewedById: app.reviewedById,
      deletedAt: app.deletedAt ? app.deletedAt.toISOString() : null,
      job: app.job ? this.toPublicJobResponse(app.job) : undefined,
    };
  }
}
