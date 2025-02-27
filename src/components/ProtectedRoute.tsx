"use client"
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { authState } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authState.loading && !authState.user) {
      router.push('/login');
    }
  }, [router, authState]);

  // Show loading spinner while checking authentication
  if (authState.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 rounded-full animate-pulse"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
          </div>
          <p className="text-lg font-medium text-gray-700">Authenticating...</p>
          <p className="mt-1 text-sm text-gray-500">Please wait while we verify your credentials</p>
        </div>
      </div>
    );
  }

  // Only render children if user is authenticated
  return authState.user ? <>{children}</> : null;
}