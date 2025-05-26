import type {Metadata} from 'next';
import { Montserrat } from 'next/font/google';
import './globals.css';

// Instantiate Montserrat and assign its CSS variable
const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
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
