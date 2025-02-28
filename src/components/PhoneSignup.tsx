"use client";
export const dynamic = 'force-dynamic';
import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext"; // Ensure this context is implemented correctly
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { ConfirmationResult } from "firebase/auth";
import { Gender, MaritalStatus } from "@/lib/types/user";
import { useRouter } from "next/navigation";
import { FirebaseError } from "firebase/app"; // Import FirebaseError for better error typing

enum SignupStep {
  PHONE_INPUT,
  OTP_VERIFICATION,
  USER_DETAILS,
}

const Spinner = () => (
  <div className="flex justify-center items-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
  </div>
);

const PhoneSignup: React.FC = () => {
  const router = useRouter();
  const { authState, sendOTP, verifyOTP, signupUser } = useAuth();
  const [currentStep, setCurrentStep] = useState<SignupStep>(
    SignupStep.PHONE_INPUT
  );

  // Loading state
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Phone input state
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [isPhoneValid, setIsPhoneValid] = useState<boolean>(false);
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);

  // OTP verification state
  const [otp, setOtp] = useState<string>("");
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);

  // User details state
  const [name, setName] = useState<string>("");
  const [age, setAge] = useState<string>("");
  const [gender, setGender] = useState<Gender>("prefer-not-to-say");
  const [occupation, setOccupation] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [maritalStatus, setMaritalStatus] = useState<MaritalStatus>("single");

  // Validation and error state
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect if user is authenticated
    if (authState.user && !authState.loading) {
      router.push("/dashboard");
    }
  }, [authState.user, authState.loading, router]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsLoading(true);

    if (!phoneNumber || !isPhoneValid) {
      setFormError("Please enter a valid phone number");
      setIsLoading(false);
      return;
    }

    try {
      const result = await sendOTP(phoneNumber, "recaptcha-container");
      setConfirmationResult(result);
      setCurrentStep(SignupStep.OTP_VERIFICATION);
    } catch (error: unknown) { // Specify the error type
      const firebaseError = error as FirebaseError;
      setFormError(firebaseError.message || "Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsLoading(true);

    if (!otp || otp.length !== 6) {
      setFormError("Please enter a valid 6-digit OTP");
      setIsLoading(false);
      return;
    }

    if (!confirmationResult) {
      setFormError("Session expired. Please try again.");
      setCurrentStep(SignupStep.PHONE_INPUT);
      setIsLoading(false);
      return;
    }

    try {
      await verifyOTP(confirmationResult, otp);
      setCurrentStep(SignupStep.USER_DETAILS);
    } catch (error: unknown) { // Specify the error type
      const firebaseError = error as FirebaseError;
      setFormError(firebaseError.message || "Invalid OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsLoading(true);

    // Validate form fields
    if (!name || !age || !gender || !occupation || !email) {
      setFormError("All fields are required");
      setIsLoading(false);
      return;
    }

    const ageNum = parseInt(age, 10);
    if (isNaN(ageNum) || ageNum < 13 || ageNum > 120) {
      setFormError("Please enter a valid age between 13 and 120");
      setIsLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    try {
      await signupUser({
        name,
        age: ageNum,
        gender,
        occupation,
        email,
        phoneNumber,
        maritalStatus,
      });

      router.push("/dashboard");
    } catch (error: unknown) { // Specify the error type
      const firebaseError = error as FirebaseError;
      setFormError(firebaseError.message || "Failed to complete signup. Please try again.");
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case SignupStep.PHONE_INPUT:
        return (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <h2 className="text-xl font-bold text-blue-700">Enter Your Phone Number</h2>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium">
                Phone Number
              </label>
              <PhoneInput
                international
                countryCallingCodeEditable={false}
                defaultCountry="IN"
                value={phoneNumber}
                onChange={(value) => {
                  setPhoneNumber(value || "");
                  setIsPhoneValid(!!value && value.length > 8);
                }}
                className="w-full p-2 border rounded mt-1 outline-none transition-all"
              />
            </div>
            <div id="recaptcha-container" ref={recaptchaContainerRef}></div>
            <button
              type="submit"
              disabled={!isPhoneValid || isLoading}
              className="w-full p-2 bg-blue-600 text-white rounded disabled:bg-blue-300 hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Spinner />
                  <span className="ml-2">Sending...</span>
                </>
              ) : (
                "Send OTP"
              )}
            </button>
          </form>
        );
      case SignupStep.OTP_VERIFICATION:
        return (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <h2 className="text-xl font-bold text-blue-700">Verify OTP</h2>
            <p className="text-sm">We&apos;ve sent a verification code to {phoneNumber}</p>
            <div className="space-y-1">
              <label htmlFor="otp" className="block text-sm font-medium">
                Enter 6-digit OTP
              </label>
              <div className="relative">
                <input
                  id="otp"
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all text-center text-lg tracking-widest"
                  placeholder="123456"
                />
                {otp.length === 6 && (
                  <div className="absolute right-3 top-2 text-green-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
            <button
              type="submit"
              disabled={otp.length !== 6 || isLoading}
              className="w-full p-2 bg-blue-600 text-white rounded disabled:bg-blue-300 hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Spinner />
                  <span className="ml-2">Verifying...</span>
                </>
              ) : (
                "Verify OTP"
              )}
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(SignupStep.PHONE_INPUT)}
              className="w-full p-2 text-blue-600 underline hover:text-blue-800 transition-colors"
              disabled={isLoading}
            >
              Change Phone Number
            </button>
          </form>
        );
      case SignupStep.USER_DETAILS:
        return (
          <form onSubmit={handleSignup} className="space-y-4">
            <h2 className="text-xl font-bold text-blue-700">Complete Your Profile</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 border rounded mt-1 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all"
                />
              </div>
              
              <div>
                <label htmlFor="age" className="block text-sm font-medium">
                  Age
                </label>
                <input
                  id="age"
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full p-2 border rounded mt-1 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="gender" className="block text-sm font-medium">
                  Gender
                </label>
                <select
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender)}
                  className="w-full p-2 border rounded mt-1 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="maritalStatus" className="block text-sm font-medium">
                  Marital Status
                </label>
                <select
                  id="maritalStatus"
                  value={maritalStatus}
                  onChange={(e) => setMaritalStatus(e.target.value as MaritalStatus)}
                  className="w-full p-2 border rounded mt-1 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all"
                >
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                  <option value="divorced">Divorced</option>
                  <option value="widowed">Widowed</option>
                </select>
              </div>
            </div>
            
            <div>
              <label htmlFor="occupation" className="block text-sm font-medium">
                Occupation
              </label>
              <input
                id="occupation"
                type="text"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                className="w-full p-2 border rounded mt-1 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded mt-1 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all"
              />
            </div>
            
            <button
              type="submit"
              className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner />
                  <span className="ml-2">Creating Account...</span>
                </>
              ) : (
                "Complete Signup"
              )}
            </button>
          </form>
        );
      default:
        return null;
    }
  };

  // Don't render the component at all if we're checking auth state or already authenticated
  // This prevents the signup page from flashing before redirect
  if (authState.loading || authState.user) {
    return null; // Return nothing instead of a loading spinner to prevent any flash
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg border border-gray-100">
      {formError && (
        <div className="p-3 mb-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded animate-pulse">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm">{formError}</p>
            </div>
          </div>
        </div>
      )}
      
      {authState.error && (
        <div className="p-3 mb-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded animate-pulse">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm">{authState.error}</p>
            </div>
          </div>
        </div>
      )}
      
      {renderStepContent()}
    </div>
  );
};

export default PhoneSignup;