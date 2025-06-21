import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import Navbar from './components/Navbar';
import Chat from './livechat/Chat';
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
       
          <main className="pt-16">{children}</main>
          <Chat/>
        </AuthProvider>
      </body>
    </html>
  );
}
