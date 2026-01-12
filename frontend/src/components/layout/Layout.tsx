import { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

/**
 * Main layout component for authenticated pages
 * Includes header with user menu and sidebar with navigation
 */
export function Layout({ children }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header onMenuClick={toggleSidebar} />

      {/* Content area with sidebar */}
      <div className="flex">
        {/* Sidebar */}
        <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

        {/* Main content */}
        <main className="flex-1 lg:ml-0">
          <div className="container mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
