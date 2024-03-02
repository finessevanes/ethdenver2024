"use client";

import { Inter } from "next/font/google";
import { PrivyProvider } from "@privy-io/react-auth";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className={inter.className}>
        <PrivyProvider appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""}>
          {children}
        </PrivyProvider>
      </body>
    </html>
  );
}
