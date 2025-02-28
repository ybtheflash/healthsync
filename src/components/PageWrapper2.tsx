"use client"

import { useEffect, useState } from 'react';
import Loader from '@/components/ui/Loader';

interface PageWrapper2Props {
  children: React.ReactNode;
}

export default function PageWrapper2({ children }: PageWrapper2Props) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000); // shorter loading time for internal pages

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
        <Loader />
      </div>
    );
  }

  return (
      {children}
  );
}
