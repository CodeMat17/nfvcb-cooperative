"use client";

import { Input } from "@/components/ui/input";
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
      if (index < length) {
        newOtp[index] = char;
      }
    });

    setOtp(newOtp);
    setActiveIndex(Math.min(pastedArray.length, length - 1));
  };

  return (
    <div className='flex justify-center gap-2 sm:gap-3'>
      {otp.map((digit, index) => (
        <motion.div
          key={index}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: index * 0.1 }}>
          <Input
            ref={(el) => (inputRefs.current[index] = el)}
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
               w-10 h-12 sm:w-12 sm:h-14
               text-center text-lg sm:text-xl font-bold
               border-2 rounded-lg
               transition-all duration-200
               focus:ring-2 focus:ring-offset-2
               ${
                 activeIndex === index
                   ? "border-blue-500 ring-blue-500/20 bg-blue-50 dark:bg-blue-950/20"
                   : "border-gray-300 dark:border-gray-600 focus:border-blue-500"
               }
               ${disabled ? "opacity-50 cursor-not-allowed" : ""}
             `}
          />
        </motion.div>
      ))}
    </div>
  );
}
