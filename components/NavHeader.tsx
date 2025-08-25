"use client";

import {
  SignedIn,
  UserButton,
} from "@clerk/nextjs";
import { ThemeToggle } from "@/components/theme-toggle";
import Image from "next/image";
import Link from "next/link";

const NavHeader = () => {
  return (
    <div className='sticky top-0 z-50 backdrop-blur-sm bg-white/80 dark:bg-gray-800/80'>
      <div className='px-4 py-2 max-w-7xl mx-auto flex justify-between items-center'>
        <Link href='/'>
          <div className='flex items-center gap-2 '>
            <Image
              src='/logo.png'
              alt='NFVCB Cooperative'
              width={40}
              height={40}
              className='object-cover rounded-md'
            />
            <p className='font-medium'>NFVCB Coop</p>
          </div>
        </Link>
        <div className='flex items-center gap-2'>
          <ThemeToggle />
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </div>
    </div>
  );
};

export default NavHeader;
