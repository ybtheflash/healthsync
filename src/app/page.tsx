"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <main className="flex flex-col items-center text-center gap-8">
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-800">
              MedSync
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl">
              Your comprehensive healthcare management solution
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-12 max-w-4xl w-full">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                Patient Records
              </h3>
              <p className="text-gray-600">
                Securely manage and access patient information
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                Appointments
              </h3>
              <p className="text-gray-600">
                Efficiently schedule and track appointments
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                Analytics
              </h3>
              <p className="text-gray-600">
                Gain insights with comprehensive analytics
              </p>
            </div>
          </div>

          <Button
            onClick={() => router.push('/dashboard')}
            className="mt-8 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full text-lg"
          >
            Enter Dashboard
          </Button>

          <div className="mt-12 text-sm text-gray-500">
            Secure • HIPAA Compliant • 24/7 Support
          </div>
        </main>
      </div>
    </div>
  );
}
