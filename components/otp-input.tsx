"use client";

import { motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";

interface OTPInputProps {
  length: number;
  onComplete: (otp: string) => void;
  disabled?: boolean;
}

export function OTPInput({
  length,
  onComplete,
  disabled = false,
}: OTPInputProps) {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(""));
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  useEffect(() => {
    const otpString = otp.join("");
    if (otpString.length === length) {
      onComplete(otpString);
    }
  }, [otp, length, onComplete]);

  const handleChange = (index: number, value: string) => {
    if (disabled) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < length - 1) {
      setActiveIndex(index + 1);
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (disabled) return;
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      setActiveIndex(index - 1);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleFocus = (index: number) => {
    setActiveIndex(index);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    if (disabled) return;
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").slice(0, length);
    const pastedArray = pastedData.split("").slice(0, length);
    const newOtp = [...otp];
    pastedArray.forEach((char, index) => {
      if (index < length) newOtp[index] = char;
    });
    setOtp(newOtp);
    setActiveIndex(Math.min(pastedArray.length, length - 1));
  };

  const filledCount = otp.filter(Boolean).length;

  return (
    <div className='space-y-4'>
      <div className='flex justify-center gap-2 sm:gap-3'>
        {otp.map((digit, index) => (
          <motion.div
            key={index}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.06, type: "spring", damping: 15, stiffness: 300 }}>
            <div className='relative'>
              <input
                ref={(el) => { inputRefs.current[index] = el; }}
                type='password'
                inputMode='numeric'
                pattern='[0-9]*'
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onFocus={() => handleFocus(index)}
                onPaste={handlePaste}
                disabled={disabled}
                className={`
                  w-11 h-13 sm:w-13 sm:h-15
                  text-center text-xl sm:text-2xl font-bold
                  rounded-xl border-2
                  transition-all duration-200
                  outline-none
                  bg-white dark:bg-slate-900
                  ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-text"}
                  ${activeIndex === index
                    ? "border-indigo-500 shadow-lg shadow-indigo-500/20 scale-105 bg-indigo-50 dark:bg-indigo-950/30"
                    : digit
                      ? "border-indigo-400/60 bg-indigo-50/50 dark:bg-indigo-950/20 dark:border-indigo-600/40"
                      : "border-border hover:border-indigo-300 dark:hover:border-indigo-700"
                  }
                `}
                style={{ width: "2.75rem", height: "3.25rem" }}
              />
              {digit && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className='absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-500'
                />
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Progress bar */}
      <div className='h-0.5 bg-border rounded-full overflow-hidden mx-4'>
        <motion.div
          className='h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full'
          initial={{ width: "0%" }}
          animate={{ width: `${(filledCount / length) * 100}%` }}
          transition={{ type: "spring", damping: 20, stiffness: 200 }}
        />
      </div>
    </div>
  );
}
