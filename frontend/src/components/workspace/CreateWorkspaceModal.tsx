import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateWorkspaceMutation } from '../../services/workspace';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/Dialog';

interface CreateWorkspaceProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

// Workspace form validation schema
const workspaceSchema = z.object({
  name: z.string().min(3, 'Workspace name must be at least 3 characters'),
  description: z.string().optional(),
});

type WorkspaceFormData = z.infer<typeof workspaceSchema>;

export function CreateWorkspaceModal({
  open,
  onOpenChange,
  onSuccess,
}: CreateWorkspaceProps) {
  const [createWorkspace, { isLoading }] = useCreateWorkspaceMutation();
  const [error, setError] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<WorkspaceFormData>({
    resolver: zodResolver(workspaceSchema),
  });

  const onSubmit = async (data: WorkspaceFormData) => {
    try {
      setError('');
      await createWorkspace(data).unwrap();

      // Reset form and close modal
      reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      setError(err?.data?.message || 'Failed to create workspace.');
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      reset();
      setError('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={handleClose}>
        <DialogHeader>
          <DialogTitle>Create New Workspace</DialogTitle>
          <DialogDescription>
            Create a workspace to organize your documents and collaborate with others.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {/* Workspace name */}
            <div className="space-y-2">
              <Label htmlFor="name">Workspace Name *</Label>
              <Input
                id="name"
                placeholder="My Study Space"
                {...register('name')}
                disabled={isLoading}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            {/* Workspace description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                placeholder="A brief description of this workspace"
                {...register('description')}
                disabled={isLoading}
              />
            </div>

            {/* Error message */}
            {error && (
              <div className="rounded-md bg-destructive/15 p-3">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Workspace'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
