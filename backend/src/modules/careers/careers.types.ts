import { JobStatus, EmploymentType, ApplicationStatus } from '@prisma/client';

export { JobStatus, EmploymentType, ApplicationStatus };

export interface JobOutput {
  id: string;
  title: string;
  department: string;
  location: string;
  employmentType: EmploymentType;
  salaryRange: string | null;
  description: string;
  requirements: string | null;
  status: JobStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  _count?: {
    applications: number;
  };
}

export interface JobApplicationOutput {
  id: string;
  jobId: string;
  job?: JobOutput;
  applicantName: string;
  email: string;
  phone: string | null;
  portfolioUrl: string | null;
  coverMessage: string | null;
  resumeFileName: string | null;
  resumeFileUrl: string | null;
  resumeMimeType: string | null;
  resumeFileSize: number | null;
  status: ApplicationStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  reviewedAt: Date | null;
  reviewedById: string | null;
  deletedAt: Date | null;
}
