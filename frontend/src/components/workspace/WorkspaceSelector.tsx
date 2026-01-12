import { useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { useGetWorkspacesQuery } from '../../services/workspace';
import { cn } from '../../lib/utils';

interface WorkspaceSelectorProps {
  value?: string;
  onChange?: (workspaceId: string) => void;
}

export function WorkspaceSelector({ value, onChange }: WorkspaceSelectorProps) {
  const { data } = useGetWorkspacesQuery();
  const [open, setOpen] = useState(false);

  const workspaces = data?.workspaces || [];
  const selectedWorkspace = workspaces.find((w) => w._id === value);

  const handleSelect = (workspaceId: string) => {
    onChange?.(workspaceId);
    setOpen(false);
  };

  if (workspaces.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between rounded-lg border border-sidebar-border bg-sidebar-accent px-3 py-2 text-sm hover:bg-sidebar-accent/80"
      >
        <span className="truncate">
          {selectedWorkspace?.name || 'Select workspace'}
        </span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute left-0 right-0 top-full z-20 mt-1 rounded-lg border border-sidebar-border bg-sidebar shadow-lg">
            <div className="max-h-60 overflow-auto p-1">
              {workspaces.map((workspace) => (
                <button
                  key={workspace._id}
                  onClick={() => handleSelect(workspace._id)}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-sidebar-accent',
                    workspace._id === value && 'bg-sidebar-accent'
                  )}
                >
                  <Check
                    className={cn(
                      'h-4 w-4',
                      workspace._id === value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <span className="truncate">{workspace.name}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
