import type { Metadata, Viewport } from "next";
import { Inter, Oswald } from "next/font/google";
import dynamic from "next/dynamic";
import "./globals.css";

const InstallPrompt = dynamic(() => import("@/components/ui/InstallPrompt"), { ssr: false });

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-heading",
});

export const metadata: Metadata = {
  title: "XRT Rough Touch Football League",
  description: "The premier rough touch football league management platform",
  icons: { icon: "/images/logo.png", apple: "/images/logo.png" },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "XRT Football",
  },
};

export const viewport: Viewport = {
  themeColor: "#DC2626",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${oswald.variable} font-body`}>
        {children}
        <InstallPrompt />
      </body>
    </html>
  );
}
