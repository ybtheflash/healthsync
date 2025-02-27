// types/user.ts
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

export interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
}