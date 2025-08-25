import { InstallPrompt } from "@/components/InstallPrompt";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import ClientLayout from "./ClientLayout";
import { ConvexClientProvider } from "./ConvexClientProvider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NFVCB Multipurpose Cooperative Society",
  description:
    "Empowering members through financial services and cooperative support",
  manifest: "/manifest.json",
  themeColor: "#3b82f6",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "NFVCB Coop",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icon-192.png", sizes: "192x192", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang='en' suppressHydrationWarning>
        <body className={inter.className}>
          <ConvexClientProvider>
            <ThemeProvider
              attribute='class'
              defaultTheme='system'
              enableSystem
              disableTransitionOnChange>
              <ClientLayout>{children}</ClientLayout>
              <Toaster />
              <InstallPrompt />
            </ThemeProvider>
          </ConvexClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
