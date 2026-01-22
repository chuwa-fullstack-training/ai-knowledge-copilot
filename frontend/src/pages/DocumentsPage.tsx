import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { DocumentList } from '../components/document/DocumentList';
import { DocumentUpload } from '../components/document/DocumentUpload';
import { useGetDocumentStatsQuery } from '../services/document';
import { Card, CardContent } from '../components/ui/Card';
import { FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export function DocumentsPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const [showUpload, setShowUpload] = useState(false);
  const { data: statsData } = useGetDocumentStatsQuery(workspaceId || '', {
    skip: !workspaceId,
  });

  if (!workspaceId) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">No workspace selected</p>
      </div>
    );
  }

  const stats = statsData?.stats;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Statistics */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Documents</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Indexed</p>
                  <p className="text-2xl font-bold">{stats.byStatus?.indexed || 0}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Processing</p>
                  <p className="text-2xl font-bold">
                    {(stats.byStatus?.uploading || 0) + (stats.byStatus?.indexing || 0)}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Failed</p>
                  <p className="text-2xl font-bold">{stats.byStatus?.failed || 0}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Upload or List */}
      {showUpload ? (
        <DocumentUpload
          workspaceId={workspaceId}
          onSuccess={() => {
            setShowUpload(false);
            // Refetch will happen automatically via RTK Query cache invalidation
          }}
          onCancel={() => setShowUpload(false)}
        />
      ) : (
        <DocumentList
          workspaceId={workspaceId}
          onUploadClick={() => setShowUpload(true)}
        />
      )}
    </div>
  );
}
