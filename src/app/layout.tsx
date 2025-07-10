import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import Navbar from './components/Navbar';

import { AuthProvider } from '@/context/AuthContext';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Watch and Earn",
  description: "watch video and earn profit",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
        <Navbar />
          <main className="pt-16">{children}</main>
          
        </AuthProvider>
      </body>
    </html>
  );
}
