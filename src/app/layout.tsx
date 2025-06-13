import type { Metadata } from 'next';
import type { ReactNode } from 'react';
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

export default async function InventoryPage() {
  console.log('Rendering InventoryPage...');
  return (
    <div>
      <h1>Inventory Page</h1>
      <p>Welcome to the inventory page!</p>
    </div>
  );
}
