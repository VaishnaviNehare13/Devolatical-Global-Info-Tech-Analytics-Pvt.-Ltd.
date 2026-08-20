import { Router, RequestHandler, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { DocumentController } from '../controllers';
import { validate } from '../../../middleware';
import {
  UploadDocumentSchema,
  UpdateDocumentSchema,
  FindDocumentsSchema,
  DocumentIdParamSchema,
} from '../dto';
import { ALLOWED_MIME_TYPES, DOCUMENT_VALIDATION } from '../constants/document.constants';
import { AppError } from '../../../utils/appError';
import { HttpStatus } from '../../../constants/httpStatus';

// Ensure dedicated documents upload directory exists
const uploadDir = path.resolve('uploads', 'documents');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer disk storage strategy with randomized safe filenames
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
    const ext = path.extname(file.originalname);
    cb(null, `doc-${uniqueSuffix}${ext}`);
  },
});

// File type filter enforcing allowed MIME types
const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if ((ALLOWED_MIME_TYPES as readonly string[]).includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        `Invalid file type: '${file.mimetype}'. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`,
        HttpStatus.BAD_REQUEST
      )
    );
  }
};

// Multer instance for single file upload
const upload = multer({
  storage,
  limits: {
    fileSize: DOCUMENT_VALIDATION.MAX_FILE_SIZE,
  },
  fileFilter,
});

/**
 * Middleware handling Multer errors and converting them into AppErrors.
 */
const handleFileUpload: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  upload.single('file')(req, res, (err: unknown) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(
            new AppError(
              `File size exceeds maximum allowed limit of ${DOCUMENT_VALIDATION.MAX_FILE_SIZE / (1024 * 1024)} MB.`,
              HttpStatus.BAD_REQUEST
            )
          );
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return next(
            new AppError(
              `Unexpected field '${err.field}'. Upload file using field name 'file'.`,
              HttpStatus.BAD_REQUEST
            )
          );
        }
        return next(new AppError(err.message, HttpStatus.BAD_REQUEST));
      }
      return next(err);
    }
    next();
  });
};

/**
 * Middleware validating metadata with cleanup of uploaded file if validation fails.
 */
const validateUploadPayload = (schema: typeof UploadDocumentSchema): RequestHandler => {
  const validator = validate({ body: schema });
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    validator(req, res, (err: unknown) => {
      if (err && req.file && req.file.path) {
        fs.unlink(req.file.path, (unlinkErr) => {
          if (unlinkErr) {
            console.error('Failed to cleanup temp uploaded file:', unlinkErr);
          }
        });
      }
      if (err) {
        return next(err);
      }
      next();
    });
  };
};

/**
 * Factory function to configure and return the Documents Express Router.
 * Applies authentication, authorization, Multer upload, and Zod validation middleware schemas.
 *
 * @param documentController Controller delegate handling endpoints
 * @param authMiddleware Middleware validating JWT Access Tokens
 * @param authorizeAdminMiddleware Middleware checking administrative permissions
 */
export function createDocumentsRouter(
  documentController: DocumentController,
  authMiddleware: RequestHandler,
  authorizeAdminMiddleware: RequestHandler
): Router {
  const router = Router();

  // Enforce authentication and authorization across all document routes
  router.use(authMiddleware);
  router.use(authorizeAdminMiddleware);

  // List all documents with paginated search/filtering parameters
  router.get('/', validate({ query: FindDocumentsSchema }), documentController.listDocuments);

  // Upload a new document with multipart/form-data
  router.post(
    '/',
    handleFileUpload,
    validateUploadPayload(UploadDocumentSchema),
    documentController.uploadDocument
  );

  // Get detailed document information by ID
  router.get(
    '/:id',
    validate({ params: DocumentIdParamSchema }),
    documentController.getDocumentById
  );

  // Securely download physical document file
  router.get(
    '/:id/download',
    validate({ params: DocumentIdParamSchema }),
    documentController.downloadDocument
  );

  // Update document metadata
  router.patch(
    '/:id',
    validate({
      params: DocumentIdParamSchema,
      body: UpdateDocumentSchema,
    }),
    documentController.updateDocument
  );

  // Archive (soft-delete) a document
  router.delete(
    '/:id',
    validate({ params: DocumentIdParamSchema }),
    documentController.archiveDocument
  );

  // Restore an archived document back to active status
  router.post(
    '/:id/restore',
    validate({ params: DocumentIdParamSchema }),
    documentController.restoreDocument
  );

  return router;
}
