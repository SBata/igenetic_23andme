import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'iGenetic | Genotype notebook',
  description: 'Inspect 23andMe genotype files locally. Research marker observations with explicit analysis limitations.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body>
        {children}
      </body>
    </html>
  );
}
