import { Router, RequestHandler } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { CareerController } from '../controllers/career.controller';
import { AppError } from '../../../utils/appError';

const uploadDir = path.join(process.cwd(), 'uploads', 'resumes');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
    cb(null, safeName);
  },
});

const allowedMimeTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Only PDF and Word documents (.pdf, .doc, .docx) are allowed for resume attachments.', 400));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

const handleMulterError: RequestHandler = (req, res, next) => {
  upload.single('resume')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new AppError('Resume file size exceeds the maximum limit of 5MB.', 400));
        }
        return next(new AppError(`File upload error: ${err.message}`, 400));
      }
      return next(err);
    }
    next();
  });
};

export function createCareerRouter(
  controller: CareerController,
  authMiddleware: RequestHandler,
  authorizeAdmin: RequestHandler
): Router {
  const router = Router();

  // Public Endpoints
  router.get('/jobs', controller.getPublicJobs);
  router.get('/jobs/:id', controller.getPublicJobById);
  router.post('/jobs/:jobId/applications', handleMulterError, controller.submitApplication);

  // Administrative Endpoints (guarded by authMiddleware & authorizeAdmin)
  router.use(authMiddleware);
  router.use(authorizeAdmin);

  router.get('/jobs-admin/all', controller.getAdminJobs);
  router.post('/jobs', controller.createAdminJob);
  router.patch('/jobs/:id', controller.updateAdminJob);
  router.delete('/jobs/:id', controller.archiveAdminJob);

  router.get('/applications', controller.getAdminApplications);
  router.get('/applications/:id', controller.getAdminApplicationById);
  router.patch('/applications/:id', controller.updateAdminApplication);
  router.delete('/applications/:id', controller.archiveAdminApplication);
  router.get('/applications/file/:filename', controller.downloadResumeFile);

  return router;
}
