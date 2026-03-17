"use client";

import { SignedIn, UserButton } from "@clerk/nextjs";
import { ThemeToggle } from "@/components/theme-toggle";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const NavHeader = () => {
  return (
    <div className='sticky top-0 z-50 border-b border-border/50 backdrop-blur-xl bg-white/80 dark:bg-slate-950/80'>
      <div className='px-4 sm:px-6 py-3 max-w-7xl mx-auto flex justify-between items-center'>
        <Link href='/' className='group'>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className='flex items-center gap-2.5'>
            <div className='relative w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 p-0.5 shadow-md shadow-indigo-500/20'>
              <div className='w-full h-full rounded-[10px] overflow-hidden bg-white dark:bg-slate-900 flex items-center justify-center'>
                <Image
                  src='/logo.png'
                  alt='NFVCB Cooperative'
                  width={30}
                  height={30}
                  className='object-cover'
                />
              </div>
            </div>
            <div className='flex flex-col leading-none'>
              <span className='text-[11px] font-medium text-muted-foreground tracking-wide'>
                NFVCB
              </span>
              <span className='text-sm font-bold bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent'>
                Cooperative
              </span>
            </div>
          </motion.div>
        </Link>

        <div className='flex items-center gap-2'>
          <ThemeToggle />
          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8 ring-2 ring-indigo-500/30",
                },
              }}
            />
          </SignedIn>
        </div>
      </div>
    </div>
  );
};

export default NavHeader;
