
import type {Metadata} from 'next';
import { Inter } from 'next/font/google'; // Changed from Geist_Sans to Inter
import './globals.css';

// Instantiate Inter and assign its CSS variable to '--font-geist-sans'
// This keeps compatibility with globals.css and tailwind.config.ts
const mainFont = Inter({
  subsets: ['latin'],
  variable: '--font-geist-sans', 
});

export const metadata: Metadata = {
  title: 'StockPilot - Inventory Management',
  description: 'Streamline your inventory with StockPilot',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // mainFont.variable will be a class name that defines the CSS variable '--font-geist-sans'
    <html lang="en" className={`${mainFont.variable}`}>
      <body className={`antialiased`}>
        {children}
      </body>
    </html>
  );
}
