import PhoneSignup from '@/components/PhoneSignup';
import type { NextPage } from 'next';
import Link from 'next/link';

const Signup: NextPage = () => {
  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Create Account</h1>
      <PhoneSignup />
      <p className="mt-4 text-center">
        Already have an account?{' '}
        <Link href="/login">
          Login
        </Link>
      </p>
    </div>
  );
};

export default Signup;
