"use client"
// context/AuthContext.tsx

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  onAuthStateChanged,
  signOut as firebaseSignOut,
  PhoneAuthProvider,
  signInWithCredential,
  ConfirmationResult,
  signInWithPhoneNumber,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { AuthState, Gender, UserProfile, MaritalStatus } from '@/lib/types/user';
import { auth, db, initRecaptcha } from '@/lib/firebase/config';

interface SignupData {
  name: string;
  age: number;
  gender: Gender;
  occupation: string;
  email: string;
  phoneNumber: string;
  maritalStatus: MaritalStatus;
}

interface AuthContextProps {
  authState: AuthState;
  sendOTP: (phoneNumber: string, recaptchaId: string) => Promise<ConfirmationResult>;
  verifyOTP: (confirmationResult: ConfirmationResult, otp: string) => Promise<void>;
  signupUser: (userData: SignupData) => Promise<void>;
  signout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextProps>({
  authState: { user: null, loading: true, error: null },
  sendOTP: async () => {
    throw new Error('Not implemented');
  },
  verifyOTP: async () => {
    throw new Error('Not implemented');
  },
  signupUser: async () => {
    throw new Error('Not implemented');
  },
  signout: async () => {
    throw new Error('Not implemented');
  }
});

export const useAuth = () => useContext(AuthContext);

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  });
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [tempUserData, setTempUserData] = useState<SignupData | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Fetch user profile from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data() as UserProfile;
            setAuthState({
              user: userData,
              loading: false,
              error: null
            });
          } else {
            // User exists in Auth but not in Firestore
            setAuthState({
              user: null,
              loading: false,
              error: null
            });
          }
        } catch (error) {
          setAuthState({
            user: null,
            loading: false,
            error: 'Failed to load user profile'
          });
        }
      } else {
        setAuthState({
          user: null,
          loading: false,
          error: null
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const sendOTP = async (phoneNumber: string, recaptchaId: string): Promise<ConfirmationResult> => {
    try {
      const recaptchaVerifier = initRecaptcha(recaptchaId);
      const result = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
      setConfirmationResult(result);
      return result;
    } catch (error: any) {
      setAuthState(prev => ({ ...prev, error: error.message }));
      throw error;
    }
  };

  const verifyOTP = async (confirmationResult: ConfirmationResult, otp: string): Promise<void> => {
    try {
      const credential = PhoneAuthProvider.credential(confirmationResult.verificationId, otp);
      await signInWithCredential(auth, credential);
      
      // If we have tempUserData, it means this is a signup process
      if (tempUserData && auth.currentUser) {
        await signupUser(tempUserData);
      }
    } catch (error: any) {
      setAuthState(prev => ({ ...prev, error: error.message }));
      throw error;
    }
  };

  const signupUser = async (userData: SignupData): Promise<void> => {
    if (!auth.currentUser) {
      setTempUserData(userData);
      throw new Error('User must be authenticated with phone first');
    }

    try {
      const uid = auth.currentUser.uid;
      const userProfile: UserProfile = {
        uid,
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Store user data in Firestore
      await setDoc(doc(db, 'users', uid), {
        ...userProfile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      setAuthState({
        user: userProfile,
        loading: false,
        error: null
      });
    } catch (error: any) {
      setAuthState(prev => ({ ...prev, error: error.message }));
      throw error;
    }
  };

  const signout = async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
      setAuthState({
        user: null,
        loading: false,
        error: null
      });
    } catch (error: any) {
      setAuthState(prev => ({ ...prev, error: error.message }));
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ authState, sendOTP, verifyOTP, signupUser, signout }}>
      {children}
    </AuthContext.Provider>
  );
};