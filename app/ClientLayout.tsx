"use client";

import NavHeader from "@/components/NavHeader";
import { useEffect, useState } from "react";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is authenticated (you can modify this logic)
    const checkAuth = () => {
      // For now, check if we're on admin or user dashboard pages
      const path = window.location.pathname;
      setIsAuthenticated(
        path.includes("/admin") || path.includes("/dashboard")
      );
    };

    checkAuth();
  }, []);

  const handleLogout = () => {
    // Clear any stored auth data
    localStorage.removeItem("user");
    sessionStorage.clear();
    // Redirect to home page
    window.location.href = "/";
  };

  return (
    <>
      <NavHeader showLogout={isAuthenticated} onLogout={handleLogout} />
      {children}
    </>
  );
}
