
import type {Metadata} from 'next';
import { Montserrat } from 'next/font/google'; // Changed from Inter to Montserrat
import './globals.css';

// Instantiate Montserrat and assign its CSS variable
const montserrat = Montserrat({ // Changed from inter to montserrat
  subsets: ['latin'],
  variable: '--font-montserrat', // Changed variable name
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
    <html lang="en" className={montserrat.variable}> {/* Changed from inter.variable */}
      <body className={`antialiased`}>
        {children}
      </body>
    </html>
  );
}
