import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'iGenetic PRO | Research-Grade 23andMe Re-Analysis Engine',
  description: 'Zero-knowledge client-side computational genomics platform for 23andMe data. High-confidence PGx, PRS, ClinVar, and GWAS re-analysis.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body className="bg-slate-50 text-slate-900 antialiased selection:bg-slate-900 selection:text-white">
        {children}
      </body>
    </html>
  );
}
