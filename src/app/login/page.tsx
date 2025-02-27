import PhoneSignup from '@/components/PhoneSignup';
import type { NextPage } from 'next';
import Link from 'next/link';

const Login: NextPage = () => {
  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Login</h1>
      <PhoneSignup />
      <p className="mt-4 text-center">
        Don't have an account?{' '}
        <Link href="/signup">
          Signup
        </Link>
      </p>
    </div>
  );
};

export default Login;