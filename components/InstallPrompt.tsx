"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Download, X } from "lucide-react";
import { useEffect, useState } from "react";

// Type for the beforeinstallprompt event
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

// Extend Navigator interface for standalone property
interface NavigatorStandalone extends Navigator {
  standalone?: boolean;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isAppInstalled, setIsAppInstalled] = useState(false);

  useEffect(() => {
    // Check if the app is already installed
    const checkIfAppInstalled = () => {
      // Check if running in standalone mode (installed PWA)
      const isStandalone = window.matchMedia(
        "(display-mode: standalone)"
      ).matches;

      // Check if running in fullscreen mode (installed PWA)
      const isFullscreen = window.matchMedia(
        "(display-mode: fullscreen)"
      ).matches;

      // Check if running in minimal-ui mode (installed PWA)
      const isMinimalUI = window.matchMedia(
        "(display-mode: minimal-ui)"
      ).matches;

      // Check if the app is running as a standalone window
      const isStandaloneWindow =
        (window.navigator as NavigatorStandalone).standalone === true;

      // Check if the app is running in a native app container
      const isNativeApp =
        window.navigator.userAgent.includes("wv") ||
        (window.navigator.userAgent.includes("Mobile") &&
          window.navigator.userAgent.includes("Safari") &&
          !window.navigator.userAgent.includes("Chrome"));

      const installed =
        isStandalone ||
        isFullscreen ||
        isMinimalUI ||
        isStandaloneWindow ||
        isNativeApp;

      setIsAppInstalled(installed);

      // Debug logging (remove in production)
      console.log("App installation check:", {
        isStandalone,
        isFullscreen,
        isMinimalUI,
        isStandaloneWindow,
        isNativeApp,
        installed,
      });

      // If app is installed, don't show the install prompt
      if (installed) {
        setShowInstallPrompt(false);
        return;
      }
    };

    // Check immediately
    checkIfAppInstalled();

    // Listen for changes in display mode
    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    const handleDisplayModeChange = () => {
      checkIfAppInstalled();
    };

    mediaQuery.addEventListener("change", handleDisplayModeChange);

    const handler = (e: Event) => {
      // Only show install prompt if app is not already installed
      if (isAppInstalled) {
        return;
      }

      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show the install prompt
      setShowInstallPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      mediaQuery.removeEventListener("change", handleDisplayModeChange);
    };
  }, [isAppInstalled]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      console.log("User accepted the install prompt");
    } else {
      console.log("User dismissed the install prompt");
    }

    // Clear the deferredPrompt
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    setDeferredPrompt(null);
  };

  // Don't show the prompt if the app is already installed
  if (isAppInstalled || !showInstallPrompt) return null;

  return (
    <Card className='fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto shadow-lg border-2 border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800'>
      <CardHeader className='pb-2'>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-sm font-semibold text-blue-900 dark:text-blue-100'>
            Install NFVCB Coop App
          </CardTitle>
          <Button
            variant='ghost'
            size='sm'
            onClick={handleDismiss}
            className='h-6 w-6 p-0 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200'>
            <X className='h-4 w-4' />
          </Button>
        </div>
        <CardDescription className='text-xs text-blue-700 dark:text-blue-300'>
          Add to your home screen for quick access
        </CardDescription>
      </CardHeader>
      <CardContent className='pt-0'>
        <Button
          onClick={handleInstallClick}
          className='w-full bg-blue-600 hover:bg-blue-700 text-white'
          size='sm'>
          <Download className='h-4 w-4 mr-2' />
          Install App
        </Button>
      </CardContent>
    </Card>
  );
}
