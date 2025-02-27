"use client"
import { useRouter } from 'next/navigation';
// components/ProtectedRoute.tsx
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

  // Show loading state while checking authentication
  if (authState.loading) {
    return <div>Loading...</div>;
  }

  // Only render children if user is authenticated
  return authState.user ? <>{children}</> : null;
}