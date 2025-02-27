"use client"

import Lottie from 'lottie-react';
import loadingAnimation from '../../../public/loading-animation.json';

interface LoaderProps {
  className?: string;
}

export default function Loader({ className }: LoaderProps) {
  return (
    <div className={`flex justify-center items-center ${className || ''}`}>
      <Lottie
        animationData={loadingAnimation}
        loop={true}
        className="w-24 h-24"
      />
    </div>
  );
}