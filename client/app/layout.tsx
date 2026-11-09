import type { Metadata } from 'next';
import './globals.css';
import './styles/components.css';
import './styles/auth.css';
import './styles/iremehub.css';
import './styles/workspace.css';
import ConditionalHeader from '../components/layout/ConditionalHeader';
import ConditionalFooter from '../components/layout/ConditionalFooter';
import ScrollToTop from '../components/ScrollToTop';
import { AuthProvider } from '../components/auth/AuthProvider';

export const metadata: Metadata = {
  title: { default: 'iremehub+ | Learning made meaningful', template: '%s | iremehub+' },
  description: 'A thoughtful learning space for students, educators and institutions.',
  applicationName: 'iremehub+',
  icons: { icon: '/favicon.png' },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          <div className="flex min-h-screen flex-col">
            <ConditionalHeader />
            <main id="main-content" className="flex-1">{children}</main>
            <ConditionalFooter />
            <ScrollToTop />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
