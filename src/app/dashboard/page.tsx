"use client"
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import type { NextPage } from 'next';

const Dashboard: NextPage = () => {
  const { authState, signout } = useAuth();
  const user = authState.user;

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        
        {user && (
          <div className="bg-white p-6 rounded shadow-md">
            <h2 className="text-xl font-bold mb-4">Your Profile</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Name</p>
                <p className="font-medium">{user.name}</p>
              </div>
              
              <div>
                <p className="text-gray-600">Age</p>
                <p className="font-medium">{user.age}</p>
              </div>
              
              <div>
                <p className="text-gray-600">Gender</p>
                <p className="font-medium">{user.gender}</p>
              </div>
              
              <div>
                <p className="text-gray-600">Occupation</p>
                <p className="font-medium">{user.occupation}</p>
              </div>
              
              <div>
                <p className="text-gray-600">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
              
              <div>
                <p className="text-gray-600">Phone</p>
                <p className="font-medium">{user.phoneNumber}</p>
              </div>
            </div>
            
            <button
              onClick={() => signout()}
              className="mt-6 px-4 py-2 bg-red-600 text-white rounded"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default Dashboard;