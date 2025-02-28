"use client";
export const dynamic = 'force-dynamic';
import React, { useState, useEffect } from 'react';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

// Types
export type Gender = 'male' | 'female' | 'other' | 'prefer-not-to-say';
export type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed';

export interface UserProfile {
  uid: string;
  name: string;
  age: number;
  gender: Gender;
  occupation: string;
  email: string;
  phoneNumber: string;
  createdAt: Date;
  updatedAt: Date;
  maritalStatus: MaritalStatus;
}

const UpdateProfileForm: React.FC<{ userId: string }> = ({ userId }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          // Convert Firebase timestamps to Date objects
          const userData = userDoc.data() as Omit<UserProfile, 'createdAt' | 'updatedAt'> & {
            createdAt: { toDate: () => Date };
            updatedAt: { toDate: () => Date };
          };
          
          setProfile({
            ...userData,
            createdAt: userData.createdAt.toDate(),
            updatedAt: userData.updatedAt.toDate(),
          });
        } else {
          setError('User profile not found.');
        }
      } catch (err) {
        setError(`Error fetching profile: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!profile) return;
    
    const { name, value, type } = e.target as HTMLInputElement;
    
    setProfile({
      ...profile,
      [name]: type === 'number' ? Number(value) : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const userRef = doc(db, 'users', userId);
      
      // Only update fields that can be changed (excluding uid, createdAt)
      const { ...updatableFields } = profile;
      
      await updateDoc(userRef, {
        ...updatableFields,
        updatedAt: new Date(),
      });
      
      setSuccess(true);
    } catch (err) {
      setError(`Error updating profile: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile) {
    return <div className="text-center p-4">Loading profile...</div>;
  }

  if (error && !profile) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  if (!profile) {
    return <div className="text-center p-4">No profile data available.</div>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="max-w-4xl w-full mx-4 p-8 rounded-lg shadow-lg" style={{ backdropFilter: 'blur(10px)', backgroundColor: 'rgba(255, 255, 255, 0.7)' }}>
        <h2 className="text-3xl font-bold mb-6 text-center">Update Profile</h2>
        
        {error && <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded mb-6">{error}</div>}
        {success && <div className="bg-green-100 border border-green-400 text-green-700 p-3 rounded mb-6">Profile updated successfully!</div>}
        
        <form onSubmit={handleSubmit}>
          {/* Row 1: Name and Age */}
          <div className="flex flex-wrap -mx-3 mb-6">
            <div className="w-full md:w-2/3 px-3 mb-6 md:mb-0">
              <label htmlFor="name" className="block text-gray-700 font-medium mb-2">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={profile.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div className="w-full md:w-1/3 px-3">
              <label htmlFor="age" className="block text-gray-700 font-medium mb-2">Age</label>
              <input
                type="number"
                id="age"
                name="age"
                min="0"
                max="120"
                value={profile.age}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          
          {/* Row 2: Gender and Marital Status */}
          <div className="flex flex-wrap -mx-3 mb-6">
            <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
              <label htmlFor="gender" className="block text-gray-700 font-medium mb-2">Gender</label>
              <select
                id="gender"
                name="gender"
                value={profile.gender}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>
            
            <div className="w-full md:w-1/2 px-3">
              <label htmlFor="maritalStatus" className="block text-gray-700 font-medium mb-2">Marital Status</label>
              <select
                id="maritalStatus"
                name="maritalStatus"
                value={profile.maritalStatus}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="single">Single</option>
                <option value="married">Married</option>
                <option value="divorced">Divorced</option>
                <option value="widowed">Widowed</option>
              </select>
            </div>
          </div>
          
          {/* Row 3: Occupation */}
          <div className="mb-6">
            <label htmlFor="occupation" className="block text-gray-700 font-medium mb-2">Occupation</label>
            <input
              type="text"
              id="occupation"
              name="occupation"
              value={profile.occupation}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          {/* Row 4: Email and Phone */}
          <div className="flex flex-wrap -mx-3 mb-6">
            <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
              <label htmlFor="email" className="block text-gray-700 font-medium mb-2">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={profile.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div className="w-full md:w-1/2 px-3">
              <label htmlFor="phoneNumber" className="block text-gray-700 font-medium mb-2">Phone Number</label>
              <div className="flex">
                <select
                  name="countryCode"
                  className="w-1/4 px-4 py-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={handleChange}
                >
                  <option value="+1">+1</option>
                  <option value="+44">+44</option>
                  <option value="+91">+91</option>
                  {/* Add more country codes as needed */}
                </select>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={profile.phoneNumber}
                  onChange={handleChange}
                  className="w-3/4 px-4 py-3 border-t border-b border-r border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-6 rounded-lg font-medium text-white ${
                loading ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
  
};

export default UpdateProfileForm;