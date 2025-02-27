"use client"

import { useState, useEffect } from 'react';
import { Activity, Brain, Heart, Shield, Stethoscope, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const features = [
  {
    title: "Health Monitoring",
    description: "Track your vital signs and health metrics in real-time",
    icon: Activity
  },
  {
    title: "Smart Analysis",
    description: "Get AI-powered insights about your health patterns",
    icon: Brain
  },
  {
    title: "Heart Health",
    description: "Monitor your cardiovascular health with precision",
    icon: Heart
  },
  {
    title: "Secure Data",
    description: "Your health data is protected with top-tier encryption",
    icon: Shield
  },
  {
    title: "Medical Records",
    description: "Keep all your medical records in one secure place",
    icon: Stethoscope
  },
  {
    title: "Community",
    description: "Connect with healthcare providers and peers",
    icon: Users
  }
];

export function FeatureCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % features.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const handleDotClick = (index: number) => {
    setActiveIndex(index);
  };

  return (
    <div className="relative h-full w-full flex flex-col items-center justify-center">
      <div className="relative w-full h-full">
        {features.map((feature, index) => {
          const isActive = index === activeIndex;
          const isPrev = index === (activeIndex - 1 + features.length) % features.length;
          const isNext = index === (activeIndex + 1) % features.length;

          return (
            <div
              key={feature.title}
              className={cn(
                "absolute inset-0 w-full h-full transition-all duration-700 ease-in-out transform",
                isActive ? "opacity-100 translate-x-0" :
                isPrev ? "opacity-0 -translate-x-full" :
                isNext ? "opacity-0 translate-x-full" :
                "opacity-0 translate-x-full"
              )}
            >
              <div className="relative h-full backdrop-blur-xl bg-white/10 rounded-2xl overflow-hidden border border-white/20 p-12">
                {/* Glass card effects */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-white/5" />
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-transparent to-purple-500/10" />
                
                {/* Content */}
                <div className="relative h-full flex flex-col justify-center">
                  <div className="mb-8">
                    <feature.icon className="h-16 w-16 text-blue-500" />
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-xl text-white/90 max-w-lg">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation dots */}
      <div className="absolute bottom-8 flex gap-3 items-center">
        {features.map((feature, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            className={cn(
              "transition-all duration-300",
              "h-3 rounded-full",
              "hover:bg-white focus:outline-none focus:ring-2 focus:ring-white/50",
              index === activeIndex 
                ? "w-8 bg-white" 
                : "w-3 bg-white/50 hover:bg-white/75"
            )}
            title={`View ${feature.title} feature`}
          />
        ))}
      </div>
    </div>
  );
}