import { Link } from 'react-router-dom';
import { useGetCurrentUserQuery, useLogoutMutation } from '../../services/auth';
import { Menu, LogOut, User, Moon, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { data } = useGetCurrentUserQuery();
  const [logout] = useLogoutMutation();
  const [isDark, setIsDark] = useState(false);

  // Initialize dark mode from localStorage
  useEffect(() => {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    setIsDark(isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !isDark;
    setIsDark(newDarkMode);
    localStorage.setItem('darkMode', String(newDarkMode));

    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Handle logout
  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Left section - Menu button and Logo */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden rounded-md p-2 hover:bg-accent"
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="text-xl font-bold">AI Knowledge Copilot</span>
          </Link>
        </div>

        {/* Right section - User menu and dark mode toggle */}
        <div className="flex items-center gap-4">
          {/* Dark mode toggle */}
          <button
            onClick={toggleDarkMode}
            className="rounded-md p-2 hover:bg-accent"
            aria-label="Toggle dark mode"
          >
            {isDark ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>

          {/* User menu */}
          {data?.user && (
            <div className="flex items-center gap-3">
              <Link
                to="/profile"
                className="flex items-center gap-2 rounded-md p-2 hover:bg-accent"
              >
                {data.user.avatarUrl ? (
                  <img
                    src={data.user.avatarUrl}
                    alt={data.user.email}
                    className="h-8 w-8 rounded-full"
                  />
                ) : (
                  <User className="h-5 w-5" />
                )}
                <span className="hidden sm:inline-block text-sm font-medium">
                  {data.user.userName || data.user.email}
                </span>
              </Link>

              <button
                onClick={handleLogout}
                className="rounded-md p-2 hover:bg-accent text-destructive"
                aria-label="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
