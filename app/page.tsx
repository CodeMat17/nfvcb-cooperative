"use client";

import { OTPInput } from "@/components/otp-input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserDashboard } from "@/components/user-dashboard";
import { api } from "@/convex/_generated/api";
import { User } from "@/types"; // Ensure this type is defined in "@/types.ts"
import { useMutation } from "convex/react";
import { motion } from "framer-motion";
import { TrendingUp, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// Define the expected response type from verifyUserByPin mutation
interface VerifyUserResponse {
  success: boolean;
  user: User | null; // Updated to allow null for invalid PIN
  message: string; // Message for success or failure
}

export default function Home() {
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [otpKey, setOtpKey] = useState<number>(0);

  const [errorMsg, setErrorMsg] = useState("");

  const verifyUser = useMutation(api.users.verifyUserByPin);

  const handleOTPComplete = async (otpValue: string) => {
    if (isVerifying) return; // Prevent multiple verifications

    setErrorMsg('');
    setIsVerifying(true);

    try {
      const result = await verifyUser({ pin: otpValue });

      if (result.success && result.user) {
        setCurrentUser(result.user);
        toast.success(`Welcome back, ${result.user.name}!`);
      } else {
        setErrorMsg(result.message);
        toast.error(result.message);
        setOtpKey((prev) => prev + 1); // Reset OTP input
      }
    } catch (error) {
      toast.error(
        "An error occurred while verifying your PIN. Please try again."
      );
      console.log(error);
      setOtpKey((prev) => prev + 1); // Reset OTP input
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    toast.success("Logged out successfully");
  };

  if (currentUser) {
    return <UserDashboard user={currentUser} onLogout={handleLogout} />;
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12'>
      {/* Main Content */}
      <main className='flex items-center justify-center p-3 sm:p-4'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='w-full max-w-md px-2 sm:px-0'>
          <Card className='shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm'>
            <CardHeader className='text-center space-y-4'>
              <div>
                <CardTitle className='text-xl sm:text-2xl font-bold text-gray-900 dark:text-white'>
                  <span className='font-normal'>Welcome to</span> <br />
                  <span className='font-medium'>
                    NFVCB Multipurpose Cooperative Society
                  </span>
                </CardTitle>
                <CardDescription className='text-gray-600 dark:text-gray-300 mt-2'>
                  Loan Management System
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='text-center space-y-2'>
                <p className='text-sm text-gray-600 dark:text-gray-400'>
                  Enter your 6-digit PIN to access your account
                </p>
                <OTPInput
                  key={otpKey}
                  length={6}
                  onComplete={handleOTPComplete}
                  disabled={isVerifying}
                />
                {errorMsg &&
                  <p className="text-sm text-red-500">{errorMsg}</p>
                }
              </div>

              {isVerifying && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className='text-center'>
                  <div className='inline-flex items-center space-x-2 text-blue-600 dark:text-blue-400'>
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-current'></div>
                    <span className='text-sm'>Verifying...</span>
                  </div>
                  
                </motion.div>
              )}

              {/* Features Preview */}
              <div className='grid grid-cols-2 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700'>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className='text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20'>
                  <TrendingUp className='h-6 w-6 text-blue-600 dark:text-blue-400 mx-auto mb-2' />
                  <p className='text-xs font-medium text-gray-700 dark:text-gray-300'>
                    Quick Loans
                  </p>
                  <p className='text-xs text-gray-500 dark:text-gray-400'>
                    6 months duration
                  </p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className='text-center p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20'>
                  <Users className='h-6 w-6 text-purple-600 dark:text-purple-400 mx-auto mb-2' />
                  <p className='text-xs font-medium text-gray-700 dark:text-gray-300'>
                    Core Loans
                  </p>
                  <p className='text-xs text-gray-500 dark:text-gray-400'>
                    2 years duration
                  </p>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
