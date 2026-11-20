import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Resume Ready — AI-Powered Career Readiness & Roadmaps',
  description: 'Convert your resume and target job description into a clear readiness assessment, actionable skill roadmap, truthful ATS improvements, and measurable learning progress.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-[#F8F9FC] text-[#253047] antialiased selection:bg-mint selection:text-navy">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}

