import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast"; // 1. Import Toaster

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Payroll System",
  description: "Hệ thống quản lý lương",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true} // 2. QUAN TRỌNG: Dòng này chặn lỗi Extension "Titan Quick View"
      >
        {/* 3. Đặt Toaster ở đây để hiện thông báo */}
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        
        {children}
      </body>
    </html>
  );
}