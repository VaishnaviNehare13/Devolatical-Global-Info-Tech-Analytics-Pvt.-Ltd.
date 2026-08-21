import { apiClient, getApiBaseUrl, getAccessToken, buildQueryString } from './client';
import type { ApiResponse, PaginatedResponse } from '../types/api';
import type {
  DocumentSummary,
  DocumentDetail,
  UploadDocumentPayload,
  UpdateDocumentRequest,
  FindDocumentsQuery,
} from '../types/document';

/**
 * Helper function to fetch binary/blob file response with auth header.
 */
async function fetchBlob(endpoint: string, params?: Record<string, unknown>): Promise<Blob> {
  const baseUrl = getApiBaseUrl();
  const queryString = buildQueryString(params);
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const fullUrl = `${baseUrl.replace(/\/+$/, '')}${normalizedEndpoint}${queryString}`;
  const token = getAccessToken();

  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(fullUrl, { headers });
  if (!response.ok) {
    throw new Error(`Document download request failed with status ${response.status} (${response.statusText})`);
  }
  return response.blob();
}

/**
 * Helper function to trigger browser file download from Blob response.
 */
function triggerBlobDownload(blob: Blob, fallbackFilename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fallbackFilename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

/**
 * Documents API Service Module.
 * Communicates with backend /api/v1/documents routes.
 */
export const documentsApi = {
  /**
   * List, search, and paginate uploaded document metadata records.
   * GET /api/v1/documents
   */
  listDocuments: (params?: FindDocumentsQuery): Promise<PaginatedResponse<DocumentSummary>> =>
    apiClient.get<PaginatedResponse<DocumentSummary>>('/documents', { params }),

  /**
   * Upload a multipart document file with metadata.
   * POST /api/v1/documents
   */
  uploadDocument: (
    payload: UploadDocumentPayload | FormData
  ): Promise<ApiResponse<DocumentDetail>> => {
    let formData: FormData;

    if (payload instanceof FormData) {
      formData = payload;
    } else {
      formData = new FormData();
      formData.append('file', payload.file);
      formData.append('title', payload.title);

      if (payload.description) {
        formData.append('description', payload.description);
      }
      if (payload.clientId) {
        formData.append('clientId', payload.clientId);
      }
      if (payload.projectId) {
        formData.append('projectId', payload.projectId);
      }
      if (payload.milestoneId) {
        formData.append('milestoneId', payload.milestoneId);
      }
    }

    return apiClient.upload<ApiResponse<DocumentDetail>>('/documents', formData);
  },

  /**
   * Get single document metadata by ID.
   * GET /api/v1/documents/:id
   */
  getDocumentById: (id: string): Promise<ApiResponse<DocumentDetail>> =>
    apiClient.get<ApiResponse<DocumentDetail>>(`/documents/${id}`),

  /**
   * Securely download physical document file.
   * GET /api/v1/documents/:id/download
   */
  downloadDocument: async (id: string, fileName?: string): Promise<void> => {
    const blob = await fetchBlob(`/documents/${id}/download`);
    triggerBlobDownload(blob, fileName || `document_${id}`);
  },

  /**
   * Update document title, description, or entity links.
   * PATCH /api/v1/documents/:id
   */
  updateDocument: (
    id: string,
    data: UpdateDocumentRequest
  ): Promise<ApiResponse<DocumentDetail>> =>
    apiClient.patch<ApiResponse<DocumentDetail>>(`/documents/${id}`, data),

  /**
   * Archive (soft delete) a document record.
   * DELETE /api/v1/documents/:id
   */
  archiveDocument: (id: string): Promise<ApiResponse<null>> =>
    apiClient.delete<ApiResponse<null>>(`/documents/${id}`),

  /**
   * Restore an archived document record back to active status.
   * POST /api/v1/documents/:id/restore
   */
  restoreDocument: (id: string): Promise<ApiResponse<DocumentDetail>> =>
    apiClient.post<ApiResponse<DocumentDetail>>(`/documents/${id}/restore`),
};
