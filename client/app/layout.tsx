import type { Metadata } from "next";
// import { Inter } from "next/font/google";
import "./globals.css";
import "./styles/components.css";
import "./styles/auth.css";
import ConditionalHeader from "../components/layout/ConditionalHeader";
// import Footer from "../components/layout/Footer"; // Commented out or remove
import ConditionalFooter from "../components/layout/ConditionalFooter"; // Added
import ScrollToTop from "../components/ScrollToTop";
import { AuthProvider } from "../components/auth/AuthProvider";

// Remove the font initialization
// const inter = Inter({ subsets: ["latin"], variable: "--font-tt-commons" });

export const metadata: Metadata = {
  title: "iremeHub LMS - Learning Without Limits",
  description: "Next generation learning management system for educators and students",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white">
        <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <ConditionalHeader />
            <main className="flex-grow main-content">{children}</main>
          <ConditionalFooter /> {/* Changed from Footer to ConditionalFooter /> */}
            <ScrollToTop />
        </div>
        </AuthProvider>
      </body>
    </html>
  );
}
