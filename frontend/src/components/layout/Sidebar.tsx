import { Link, useLocation } from 'react-router-dom';
import { Home, Briefcase, FileText, MessageSquare, User, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../lib/utils';
import { WorkspaceSelector } from '../workspace/WorkspaceSelector';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    name: 'Workspaces',
    href: '/workspace',
    icon: Briefcase,
  },
  {
    name: 'Documents',
    href: '/documents',
    icon: FileText,
  },
  {
    name: 'Chat',
    href: '/chat',
    icon: MessageSquare,
  },
  {
    name: 'Profile',
    href: '/profile',
    icon: User,
  },
];

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const location = useLocation();
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>('');

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 border-r border-border bg-sidebar transition-transform duration-300 lg:sticky lg:block',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Close button for mobile */}
        <div className="flex items-center justify-between p-4 lg:hidden">
          <span className="text-lg font-semibold">Menu</span>
          <button
            onClick={onClose}
            className="rounded-md p-2 hover:bg-sidebar-accent"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Workspace selector */}
        <div className="px-4 pt-4 pb-2">
          <WorkspaceSelector
            value={selectedWorkspace}
            onChange={setSelectedWorkspace}
          />
        </div>

        {/* Navigation */}
        <nav className="space-y-1 p-4">{navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;

            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
