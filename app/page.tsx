"use client";

import { OTPInput } from "@/components/otp-input";
import { UserDashboard } from "@/components/user-dashboard";
import { api } from "@/convex/_generated/api";
import { User } from "@/types";
import { useMutation } from "convex/react";
import { AnimatePresence, motion } from "framer-motion";
import { Building2, Shield, Zap } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";

export default function Home() {
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [otpKey, setOtpKey] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState("");

  const verifyUser = useMutation(api.users.verifyUserByPin);

  const handleOTPComplete = async (otpValue: string) => {
    if (isVerifying) return;
    setErrorMsg("");
    setIsVerifying(true);
    try {
      const result = await verifyUser({ pin: otpValue });
      if (result.success && result.user) {
        setCurrentUser(result.user);
        toast.success(`Welcome back, ${result.user.name}!`);
      } else {
        setErrorMsg(result.message);
        toast.error(result.message);
        setOtpKey((prev) => prev + 1);
      }
    } catch (error) {
      toast.error("An error occurred while verifying your PIN. Please try again.");
      console.log(error);
      setOtpKey((prev) => prev + 1);
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
    <div className='relative min-h-[calc(100vh-57px)] overflow-hidden bg-gradient-to-br from-slate-50 via-indigo-50/40 to-violet-50/40 dark:from-slate-950 dark:via-indigo-950/30 dark:to-slate-950 flex items-center justify-center p-4 sm:p-6'>

      {/* Animated background orbs */}
      <motion.div
        animate={{ x: [0, 25, 0], y: [0, -18, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className='absolute top-1/4 left-1/6 w-72 h-72 rounded-full bg-indigo-400/10 dark:bg-indigo-500/8 blur-3xl pointer-events-none'
      />
      <motion.div
        animate={{ x: [0, -18, 0], y: [0, 22, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        className='absolute bottom-1/4 right-1/6 w-80 h-80 rounded-full bg-violet-400/10 dark:bg-violet-500/8 blur-3xl pointer-events-none'
      />
      <motion.div
        animate={{ x: [0, 12, 0], y: [0, 12, 0] }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-purple-300/8 dark:bg-purple-500/5 blur-3xl pointer-events-none'
      />

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", damping: 22, stiffness: 180 }}
        className='relative w-full max-w-md'>

        {/* Top accent line */}
        <div className='absolute -top-px left-10 right-10 h-px bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent' />

        <div className='relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-2xl border border-white/60 dark:border-white/8 shadow-2xl shadow-indigo-500/5 dark:shadow-indigo-500/10 overflow-hidden'>

          {/* Subtle inner glow top */}
          <div className='absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-indigo-50/60 dark:from-indigo-950/20 to-transparent pointer-events-none' />

          <div className='relative p-7 sm:p-9'>

            {/* Logo + Title */}
            <div className='text-center mb-8'>
              <motion.div
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", damping: 14, stiffness: 250, delay: 0.1 }}
                className='inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30 mb-4'>
                <Image
                  src='/logo.png'
                  alt='NFVCB Cooperative'
                  width={38}
                  height={38}
                  className='object-contain'
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}>
                <p className='text-xs font-semibold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mb-1'>
                  Welcome to
                </p>
                <h1 className='text-xl sm:text-2xl font-bold text-foreground leading-tight'>
                  NFVCB Multipurpose
                </h1>
                <h2 className='text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent leading-tight'>
                  Cooperative Society
                </h2>
                <p className='text-muted-foreground text-sm mt-2'>
                  Loan Management System
                </p>
              </motion.div>
            </div>

            {/* Divider */}
            <div className='h-px bg-gradient-to-r from-transparent via-border to-transparent mb-7' />

            {/* PIN section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className='space-y-5'>
              <div className='text-center'>
                <div className='inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/60 rounded-full px-3 py-1 mb-4'>
                  <Shield className='w-3 h-3' />
                  <span>Secured with 6-digit PIN</span>
                </div>
                <OTPInput
                  key={otpKey}
                  length={6}
                  onComplete={handleOTPComplete}
                  disabled={isVerifying}
                />
                <AnimatePresence>
                  {errorMsg && (
                    <motion.p
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className='text-destructive text-sm mt-3 font-medium'>
                      {errorMsg}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <AnimatePresence>
                {isVerifying && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className='flex items-center justify-center gap-2.5'>
                    <div className='flex gap-1'>
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.18 }}
                          className='w-1.5 h-1.5 rounded-full bg-indigo-500'
                        />
                      ))}
                    </div>
                    <span className='text-sm text-indigo-600 dark:text-indigo-400 font-medium'>
                      Verifying...
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Feature cards */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className='grid grid-cols-2 gap-3 mt-7 pt-7 border-t border-border/60'>
              <motion.div
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className='p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 cursor-default'>
                <div className='flex items-center gap-2 mb-1'>
                  <div className='w-6 h-6 rounded-lg bg-indigo-500/15 flex items-center justify-center'>
                    <Zap className='w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400' />
                  </div>
                  <span className='text-xs font-semibold text-foreground'>Quick Loans</span>
                </div>
                <p className='text-[11px] text-muted-foreground'>6 months • 5% interest</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className='p-3.5 rounded-xl bg-violet-50 dark:bg-violet-950/30 border border-violet-100 dark:border-violet-900/50 cursor-default'>
                <div className='flex items-center gap-2 mb-1'>
                  <div className='w-6 h-6 rounded-lg bg-violet-500/15 flex items-center justify-center'>
                    <Building2 className='w-3.5 h-3.5 text-violet-600 dark:text-violet-400' />
                  </div>
                  <span className='text-xs font-semibold text-foreground'>Core Loans</span>
                </div>
                <p className='text-[11px] text-muted-foreground'>2 years duration</p>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Bottom accent line */}
        <div className='absolute -bottom-px left-10 right-10 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent' />
      </motion.div>
    </div>
  );
}
