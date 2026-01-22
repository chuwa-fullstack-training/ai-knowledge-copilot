import { api } from './api';
import type { Document, DocumentStatus } from './api';

// Document list response
export interface DocumentListResponse {
  documents: Document[];
  total: number;
  hasMore: boolean;
}

// Document stats response
export interface DocumentStatsResponse {
  stats: {
    total: number;
    byStatus: Record<DocumentStatus, number>;
    totalSize: number;
  };
}

// Document upload data
export interface UploadDocumentData {
  workspaceId: string;
  file: File;
  title?: string;
  onProgress?: (progress: number) => void;
}

// Document API endpoints
export const documentApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // List documents in workspace
    getDocuments: builder.query<
      DocumentListResponse,
      {
        workspaceId: string;
        status?: DocumentStatus;
        limit?: number;
        offset?: number;
      }
    >({
      query: ({ workspaceId, status, limit, offset }) => {
        const params = new URLSearchParams();
        if (status) params.append('status', status);
        if (limit !== undefined) params.append('limit', limit.toString());
        if (offset !== undefined) params.append('offset', offset.toString());

        const queryString = params.toString();
        return `/workspaces/${workspaceId}/documents${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['Document'],
    }),

    // Get single document
    getDocument: builder.query<{ document: Document }, string>({
      query: (documentId) => `/documents/${documentId}`,
      providesTags: ['Document'],
    }),

    // Upload document (custom handler for multipart/form-data)
    uploadDocument: builder.mutation<
      { document: Document },
      { workspaceId: string; formData: FormData }
    >({
      query: ({ workspaceId, formData }) => ({
        url: `/workspaces/${workspaceId}/documents/upload`,
        method: 'POST',
        body: formData,
        // Don't set Content-Type header, let the browser set it with boundary
        formData: true,
      }),
      invalidatesTags: ['Document'],
    }),

    // Update document status
    updateDocumentStatus: builder.mutation<
      { document: Document },
      { documentId: string; status: DocumentStatus; errorMessage?: string }
    >({
      query: ({ documentId, status, errorMessage }) => ({
        url: `/documents/${documentId}/status`,
        method: 'PATCH',
        body: { status, errorMessage },
      }),
      invalidatesTags: ['Document'],
    }),

    // Delete document
    deleteDocument: builder.mutation<void, string>({
      query: (documentId) => ({
        url: `/documents/${documentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Document'],
    }),

    // Get workspace document statistics
    getDocumentStats: builder.query<DocumentStatsResponse, string>({
      query: (workspaceId) => `/workspaces/${workspaceId}/documents/stats`,
      providesTags: ['Document'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetDocumentsQuery,
  useGetDocumentQuery,
  useUploadDocumentMutation,
  useUpdateDocumentStatusMutation,
  useDeleteDocumentMutation,
  useGetDocumentStatsQuery,
} = documentApi;

// Helper function to upload document with progress tracking
export async function uploadDocumentWithProgress(
  data: UploadDocumentData,
  token: string
): Promise<{ document: Document }> {
  const { workspaceId, file, title, onProgress } = data;

  const formData = new FormData();
  formData.append('file', file);
  if (title) {
    formData.append('title', title);
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Track upload progress
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        const percentComplete = (event.loaded / event.total) * 100;
        onProgress(percentComplete);
      }
    });

    // Handle completion
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } catch (error) {
          reject(new Error('Invalid response format'));
        }
      } else {
        try {
          const error = JSON.parse(xhr.responseText);
          reject(new Error(error.message || 'Upload failed'));
        } catch {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    });

    // Handle errors
    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed'));
    });

    xhr.addEventListener('abort', () => {
      reject(new Error('Upload cancelled'));
    });

    // Open and send request
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
    xhr.open('POST', `${API_BASE_URL}/workspaces/${workspaceId}/documents/upload`);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.send(formData);
  });
}
