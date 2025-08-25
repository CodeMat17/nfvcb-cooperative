"use client";

import NavHeader from "@/components/NavHeader";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <>
      <NavHeader />
      {children}
    </>
  );
}
