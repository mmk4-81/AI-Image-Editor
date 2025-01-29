import type { Metadata } from "next";
import {  IBM_Plex_Sans  } from "next/font/google";
import "./globals.css";


const IBMPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ibm-plex",
});

export const metadata: Metadata = {
  title: "Maginify",
  description: "AI-powered image generation",
 
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={` ${IBMPlexSans.className} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
