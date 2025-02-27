/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
// components/PhoneSignup.tsx
import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext"; // Ensure this context is implemented correctly
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { ConfirmationResult } from "firebase/auth";
import { Gender, MaritalStatus } from "@/lib/types/user";
import { useRouter } from "next/navigation";

enum SignupStep {
  PHONE_INPUT,
  OTP_VERIFICATION,
  USER_DETAILS,
}

const PhoneSignup: React.FC = () => {
  const router = useRouter();
  const { authState, sendOTP, verifyOTP, signupUser } = useAuth();
  const [currentStep, setCurrentStep] = useState<SignupStep>(
    SignupStep.PHONE_INPUT
  );

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

    if (!phoneNumber || !isPhoneValid) {
      setFormError("Please enter a valid phone number");
      return;
    }

    try {
      const result = await sendOTP(phoneNumber, "recaptcha-container");
      setConfirmationResult(result);
      setCurrentStep(SignupStep.OTP_VERIFICATION);
    } catch (error: any) {
      setFormError(error.message || "Failed to send OTP. Please try again.");
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!otp || otp.length !== 6) {
      setFormError("Please enter a valid 6-digit OTP");
      return;
    }

    if (!confirmationResult) {
      setFormError("Session expired. Please try again.");
      setCurrentStep(SignupStep.PHONE_INPUT);
      return;
    }

    try {
      await verifyOTP(confirmationResult, otp);
      setCurrentStep(SignupStep.USER_DETAILS);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setFormError(error.message || "Invalid OTP. Please try again.");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validate form fields
    if (!name || !age || !gender || !occupation || !email) {
      setFormError("All fields are required");
      return;
    }

    const ageNum = parseInt(age, 10);
    if (isNaN(ageNum) || ageNum < 13 || ageNum > 120) {
      setFormError("Please enter a valid age between 13 and 120");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormError("Please enter a valid email address");
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setFormError(error.message || "Failed to complete signup. Please try again.");
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case SignupStep.PHONE_INPUT:
        return (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <h2 className="text-xl font-bold">Enter Your Phone Number</h2>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium">
                Phone Number
              </label>
              <PhoneInput
                international
                countryCallingCodeEditable={false}
                defaultCountry="US"
                value={phoneNumber}
                onChange={(value) => {
                  setPhoneNumber(value || "");
                  setIsPhoneValid(!!value && value.length > 8);
                }}
                className="w-full p-2 border rounded mt-1"
              />
            </div>
            <div id="recaptcha-container" ref={recaptchaContainerRef}></div>
            <button
              type="submit"
              disabled={!isPhoneValid}
              className="w-full p-2 bg-blue-600 text-white rounded disabled:bg-blue-300"
            >
              Send OTP
            </button>
          </form>
        );
      case SignupStep.OTP_VERIFICATION:
        return (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <h2 className="text-xl font-bold">Verify OTP</h2>
            <p className="text-sm">We&apos;ve sent a verification code to {phoneNumber}</p>
            <div>
              <label htmlFor="otp" className="block text-sm font-medium">
                Enter 6-digit OTP
              </label>
              <input
                id="otp"
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="w-full p-2 border rounded mt-1"
                placeholder="123456"
              />
            </div>
            <button
              type="submit"
              disabled={otp.length !== 6}
              className="w-full p-2 bg-blue-600 text-white rounded disabled:bg-blue-300"
            >
              Verify OTP
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(SignupStep.PHONE_INPUT)}
              className="w-full p-2 text-blue-600 underline"
            >
              Change Phone Number
            </button>
          </form>
        );
      case SignupStep.USER_DETAILS:
        return (
          <form onSubmit={handleSignup} className="space-y-4">
            <h2 className="text-xl font-bold">Complete Your Profile</h2>
            <div>
              <label htmlFor="name" className="block text-sm font-medium">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border rounded mt-1"
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
                className="w-full p-2 border rounded mt-1"
              />
            </div>
            <div>
              <label htmlFor="gender" className="block text-sm font-medium">
                Gender
              </label>
              <select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value as Gender)}
                className="w-full p-2 border rounded mt-1"
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
                className="w-full p-2 border rounded mt-1"
              >
                <option value="single">Single</option>
                <option value="married">Married</option>
                <option value="divorced">Divorced</option>
                <option value="widowed">Widowed</option>
              </select>
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
                className="w-full p-2 border rounded mt-1"
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
                className="w-full p-2 border rounded mt-1"
              />
            </div>
            <button
              type="submit"
              className="w-full p-2 bg-blue-600 text-white rounded"
            >
              Complete Signup
            </button>
          </form>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow-md">
      {formError && (
        <div className="p-2 mb-4 bg-red-100 text-red-700 rounded">
          {formError}
        </div>
      )}
      {authState.error && (
        <div className="p-2 mb-4 bg-red-100 text-red-700 rounded">
          {authState.error}
        </div>
      )}
      {renderStepContent()}
    </div>
  );
};

export default PhoneSignup;