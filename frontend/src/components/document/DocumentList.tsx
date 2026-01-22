import { useState } from 'react';
import { useGetDocumentsQuery, useDeleteDocumentMutation } from '../../services/document';
import type { DocumentStatus } from '../../services/api';
import { Button } from '../ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/Card';
import { FileText, Trash2, Clock, CheckCircle, AlertCircle, Loader2, Upload } from 'lucide-react';

interface DocumentListProps {
  workspaceId: string;
  onUploadClick?: () => void;
}

const STATUS_ICONS: Record<DocumentStatus, React.ReactNode> = {
  uploading: <Loader2 className="h-4 w-4 animate-spin text-blue-500" />,
  uploaded: <Clock className="h-4 w-4 text-gray-500" />,
  indexing: <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />,
  indexed: <CheckCircle className="h-4 w-4 text-green-500" />,
  failed: <AlertCircle className="h-4 w-4 text-red-500" />,
};

const STATUS_LABELS: Record<DocumentStatus, string> = {
  uploading: 'Uploading',
  uploaded: 'Uploaded',
  indexing: 'Indexing',
  indexed: 'Indexed',
  failed: 'Failed',
};

const STATUS_COLORS: Record<DocumentStatus, string> = {
  uploading: 'text-blue-600 bg-blue-50',
  uploaded: 'text-gray-600 bg-gray-50',
  indexing: 'text-yellow-600 bg-yellow-50',
  indexed: 'text-green-600 bg-green-50',
  failed: 'text-red-600 bg-red-50',
};

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return date.toLocaleDateString();
}

export function DocumentList({ workspaceId, onUploadClick }: DocumentListProps) {
  const { data, isLoading, refetch } = useGetDocumentsQuery({ workspaceId });
  const [deleteDocument] = useDeleteDocumentMutation();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (documentId: string) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      setDeletingId(documentId);
      await deleteDocument(documentId).unwrap();
    } catch (error) {
      console.error('Failed to delete document:', error);
      alert('Failed to delete document');
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="ml-2 text-muted-foreground">Loading documents...</p>
      </div>
    );
  }

  const documents = data?.documents || [];

  return (
    <div className="space-y-6">
      {/* Header with upload button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Documents</h2>
          <p className="text-muted-foreground">
            Upload and manage your knowledge base documents
          </p>
        </div>
        {onUploadClick && (
          <Button onClick={onUploadClick}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Document
          </Button>
        )}
      </div>

      {/* Documents list */}
      {documents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No documents yet</h3>
            <p className="text-muted-foreground mb-4">
              Upload your first document to start building your knowledge base
            </p>
            {onUploadClick && (
              <Button onClick={onUploadClick}>
                <Upload className="mr-2 h-4 w-4" />
                Upload Document
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {documents.map((document) => (
            <Card key={document._id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1 min-w-0">
                    <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base truncate">{document.title}</CardTitle>
                      <CardDescription className="mt-1 text-sm truncate">
                        {document.originalName}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <div
                      className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                        STATUS_COLORS[document.status]
                      }`}
                    >
                      {STATUS_ICONS[document.status]}
                      <span className="ml-1">{STATUS_LABELS[document.status]}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span>{formatFileSize(document.size)}</span>
                  <span>•</span>
                  <span>{formatDate(document.createdAt)}</span>
                  {document.mimeType && (
                    <>
                      <span>•</span>
                      <span className="truncate">{document.mimeType.split('/')[1].toUpperCase()}</span>
                    </>
                  )}
                </div>
                {document.status === 'failed' && document.errorMessage && (
                  <p className="mt-2 text-sm text-red-600">{document.errorMessage}</p>
                )}
              </CardContent>
              <CardFooter className="pt-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(document._id)}
                  disabled={deletingId === document._id}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  {deletingId === document._id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  <span className="ml-2">Delete</span>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Load more indicator */}
      {data?.hasMore && (
        <div className="text-center">
          <Button variant="outline" onClick={() => refetch()}>
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}
