import { useState } from 'react';
import { useGetWorkspacesQuery, useDeleteWorkspaceMutation } from '../../services/workspace';
import { Button } from '../ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/Card';
import { CreateWorkspaceModal } from './CreateWorkspaceModal';
import { Plus, Users, Trash2 } from 'lucide-react';

export function WorkspaceList() {
  const { data, isLoading, refetch } = useGetWorkspacesQuery();
  const [deleteWorkspace] = useDeleteWorkspaceMutation();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (workspaceId: string) => {
    if (!window.confirm('Are you sure you want to delete this workspace?')) {
      return;
    }

    try {
      setDeletingId(workspaceId);
      await deleteWorkspace(workspaceId).unwrap();
    } catch (error) {
      console.error('Failed to delete workspace:', error);
      alert('Failed to delete workspace');
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Loading workspaces...</p>
      </div>
    );
  }

  const workspaces = data?.workspaces || [];

  return (
    <div className="space-y-6">
      {/* Header with create button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Your Workspaces</h2>
          <p className="text-muted-foreground">
            Manage your workspaces and collaborate with your team
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Workspace
        </Button>
      </div>

      {/* Workspaces grid */}
      {workspaces.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No workspaces yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first workspace to start organizing your knowledge
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Workspace
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((workspace) => (
            <Card key={workspace._id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{workspace.name}</CardTitle>
                {workspace.description && (
                  <CardDescription>{workspace.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="flex-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{workspace.members.length} member{workspace.members.length !== 1 ? 's' : ''}</span>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    // Navigate to workspace details (to be implemented)
                    alert('Workspace details coming soon!');
                  }}
                >
                  View
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(workspace._id)}
                  disabled={deletingId === workspace._id}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Create workspace modal */}
      <CreateWorkspaceModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSuccess={refetch}
      />
    </div>
  );
}
