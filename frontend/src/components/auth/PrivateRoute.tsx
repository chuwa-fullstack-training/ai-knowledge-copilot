import { Navigate } from "react-router-dom";
import { useGetCurrentUserQuery } from "../../services/auth";

interface PrivateRouteProps {
  children: React.ReactNode;
}

/**
 * PrivateRoute component for protecting authenticated routes
 * Redirects to login if user is not authenticated
 */
export function PrivateRoute({ children }: PrivateRouteProps) {
  const token = localStorage.getItem("token");

  // Verify token by fetching current user
  const { isLoading, isError } = useGetCurrentUserQuery();

  // If no token, redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Show loading state while verifying token
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // If token is invalid, redirect to login
  if (isError) {
    localStorage.removeItem("token");
    return <Navigate to="/login" replace />;
  }

  // Token is valid, render protected content
  return <>{children}</>;
}
