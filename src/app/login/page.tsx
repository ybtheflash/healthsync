import PhoneSignup from '@/components/PhoneSignup';
import type { NextPage } from 'next';
import Link from 'next/link';
import { HeartPulse } from 'lucide-react';
import { FeatureCarousel } from '@/components/ui/feature-carousel';

const Login: NextPage = () => {
  return (
    <div className="min-h-screen flex items-stretch">
      {/* Form Side */}
      <div className="w-full md:w-[480px] flex-none p-8 bg-white flex items-center">
        <div className="w-full max-w-sm mx-auto">
          {/* Logo and Title */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 mb-6">
              <HeartPulse className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to your HealthSync account</p>
          </div>

          {/* Login Form */}
          <div className="space-y-6">
            <PhoneSignup />
            <div className="border-t border-gray-200 pt-6">
              <p className="text-center text-gray-600">
                Don&apos;t have an account?{' '}
                <Link 
                  href="/signup" 
                  className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  Create one now
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Side */}
      <div className="hidden md:flex flex-1 bg-gray-900 relative overflow-hidden">
        <FeatureCarousel />
      </div>
    </div>
  );
};

export default Login;