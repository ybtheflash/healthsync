import PhoneSignup from '@/components/PhoneSignup';
import type { NextPage } from 'next';
import Link from 'next/link';
import Image from 'next/image';

const Signup: NextPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 mb-4">
            <Image
              src="/globe.svg"
              alt="HealthSync Logo"
              width={32}
              height={32}
              className="brightness-0 invert"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Join HealthSync</h1>
          <p className="text-gray-600">Create your account to start your health journey</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-xl p-8">
          <PhoneSignup />
          <div className="mt-6 border-t border-gray-200 pt-6">
            <p className="text-center text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
                Sign in now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
