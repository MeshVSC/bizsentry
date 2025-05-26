
import type {Metadata} from 'next';
import { Montserrat } from 'next/font/google'; // Using Montserrat
import './globals.css';

// Instantiate Montserrat and assign its CSS variable
const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat', // CSS variable for Montserrat
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
    <html lang="en" className={montserrat.variable}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
