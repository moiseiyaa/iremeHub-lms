// import type { Metadata } from "next";
// import { Inter } from "next/font/google";
import "./globals.css";
import "./styles/components.css";
import "./styles/auth.css";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import ScrollToTop from "../components/ScrollToTop";
import { AuthProvider } from "../components/auth/AuthProvider";

// Remove the font initialization
// const inter = Inter({ subsets: ["latin"], variable: "--font-tt-commons" });

export const metadata = {
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
          <div className="flex flex-col min-h-screen relative z-10">
            <Header />
            <main className="flex-grow main-content">{children}</main>
            <Footer />
            <ScrollToTop />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
