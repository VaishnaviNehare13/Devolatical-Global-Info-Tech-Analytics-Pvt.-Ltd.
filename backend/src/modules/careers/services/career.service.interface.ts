import { JobOutput, JobApplicationOutput } from '../careers.types';
import { CreateJobDTO } from '../dto/create-job.dto';
import { UpdateJobDTO } from '../dto/update-job.dto';
import { FindJobsDTO } from '../dto/find-jobs.dto';
import { CreateApplicationDTO } from '../dto/create-application.dto';
import { UpdateApplicationDTO } from '../dto/update-application.dto';
import { FindApplicationsDTO } from '../dto/find-applications.dto';

export interface ICareerService {
  createJob(data: CreateJobDTO, currentUserId?: string): Promise<JobOutput>;
  getJobById(id: string, includeDeleted?: boolean): Promise<JobOutput>;
  getJobs(params: FindJobsDTO): Promise<{ items: JobOutput[]; total: number; page: number; limit: number }>;
  updateJob(id: string, data: UpdateJobDTO, currentUserId?: string): Promise<JobOutput>;
  archiveJob(id: string, currentUserId?: string): Promise<void>;

  submitApplication(
    jobId: string,
    data: CreateApplicationDTO,
    resumeData?: {
      resumeFileName: string;
      resumeFileUrl: string;
      resumeMimeType: string;
      resumeFileSize: number;
    }
  ): Promise<JobApplicationOutput>;

  getApplicationById(id: string, includeDeleted?: boolean): Promise<JobApplicationOutput>;
  getApplications(params: FindApplicationsDTO): Promise<{ items: JobApplicationOutput[]; total: number; page: number; limit: number }>;
  updateApplication(id: string, data: UpdateApplicationDTO, currentUserId?: string): Promise<JobApplicationOutput>;
  archiveApplication(id: string, currentUserId?: string): Promise<void>;
}
