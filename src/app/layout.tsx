
import type {Metadata} from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

// Instantiate Inter and assign its CSS variable
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'StockSentry - Inventory Management',
  description: 'Streamline your inventory with StockSentry',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Apply the CSS variable to the html tag
    <html lang="en" className={inter.variable}>
      <body className={`antialiased`}>
        {children}
      </body>
    </html>
  );
}
