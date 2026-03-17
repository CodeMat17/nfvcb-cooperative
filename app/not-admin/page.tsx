"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft, Lock, ShieldOff } from "lucide-react";
import Link from "next/link";

export default function NotAdminPage() {
  return (
    <div className='min-h-[calc(100vh-57px)] bg-gradient-to-br from-slate-50 via-rose-50/30 to-orange-50/20 dark:from-slate-950 dark:via-slate-950 dark:to-rose-950/10 flex items-center justify-center px-4 py-12'>
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", damping: 22, stiffness: 200 }}
        className='w-full max-w-sm'>

        <div className='relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-border/60 shadow-xl overflow-hidden text-center p-8'>
          {/* Top accent */}
          <div className='absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500' />

          {/* Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", damping: 14, stiffness: 250, delay: 0.15 }}
            className='inline-flex items-center justify-center w-18 h-18 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/50 mb-5 mx-auto'
            style={{ width: "4.5rem", height: "4.5rem" }}>
            <ShieldOff className='w-9 h-9 text-rose-500 dark:text-rose-400' />
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className='text-2xl font-bold text-foreground mb-2'>
            Access Denied
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28 }}
            className='text-muted-foreground text-sm mb-6 leading-relaxed'>
            You don&apos;t have administrator privileges to access this area.
            Please contact your system administrator if you believe this is an error.
          </motion.p>

          {/* Protected badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className='inline-flex items-center gap-1.5 bg-muted/60 rounded-full px-3 py-1.5 text-xs text-muted-foreground mb-6'>
            <Lock className='w-3 h-3' />
            Protected admin area
          </motion.div>

          {/* Back button */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.42 }}>
            <Link href='/'>
              <Button className='w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white border-0 shadow-md shadow-indigo-500/20 gap-2'>
                <ArrowLeft className='w-4 h-4' />
                Go Back to Homepage
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
