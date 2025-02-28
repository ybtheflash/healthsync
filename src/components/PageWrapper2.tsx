"use client"

import React, { ReactNode, useEffect, useState } from 'react';
import Loader from '@/components/ui/Loader';

interface PageWrapper2Props {
  children: ReactNode;
}

const PageWrapper2: React.FC<PageWrapper2Props> = ({ children }) => {
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

  return <div>{children}</div>;
};

export default PageWrapper2;
