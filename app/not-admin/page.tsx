"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowLeft, Shield } from "lucide-react";
import Link from "next/link";

export default function NotAdminPage() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex py-12 justify-center px-4'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='w-full max-w-md'>
        <Card className='border-red-200 dark:border-red-800 shadow-lg'>
          <CardContent className='p-8 text-center'>
            {/* Warning Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className='mx-auto mb-6 w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center'>
              <AlertTriangle className='h-10 w-10 text-red-600 dark:text-red-400' />
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className='text-2xl font-bold text-gray-900 dark:text-white mb-3'>
              Access Denied
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className='text-gray-600 dark:text-gray-400 mb-6'>
              You don&apos;t have administrator privileges to access this page.
            </motion.p>

            {/* Security Icon */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className='flex items-center justify-center mb-6 text-gray-500 dark:text-gray-400'>
              <Shield className='h-5 w-5 mr-2' />
              <span className='text-sm'>Protected Area</span>
            </motion.div>

            {/* Go Back Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}>
              <Link href='/'>
                <Button className='w-full bg-blue-600 hover:bg-blue-700 text-white'>
                  <ArrowLeft className='h-4 w-4 mr-2' />
                  Go Back to Homepage
                </Button>
              </Link>
            </motion.div>

            {/* Additional Info */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className='text-xs text-gray-500 dark:text-gray-400 mt-4'>
              If you believe this is an error, please contact your system
              administrator.
            </motion.p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
