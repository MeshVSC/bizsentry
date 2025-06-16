"use client";

import { Plus, Package } from 'lucide-react';
import Link from 'next/link';

interface EmptyStateProps {
  isNoItems: boolean;
  searchQuery?: string;
}

export default function EmptyState({ isNoItems, searchQuery }: EmptyStateProps) {
  if (isNoItems) {
    return (
      <div className="glass-card p-12 text-center">
        <div className="mx-auto w-20 h-20 rounded-full bg-[#ff9f43]/10 flex items-center justify-center mb-6">
          <Package className="h-10 w-10 text-[#ff9f43]/60" />
        </div>
        <h3 className="text-xl font-semibold mb-3">No Inventory Items</h3>
        <p className="text-muted-foreground max-w-md mx-auto mb-8">
          You haven&apos;t added any items yet. Get started by adding your first item to begin managing your inventory.
        </p>
        <button className="gradient-btn text-white px-6 py-2 rounded-lg font-medium hover:scale-105 transition-transform">
          <Link href="/inventory/add" className="flex items-center">
            <Plus className="mr-2 h-4 w-4" />
            Add First Item
          </Link>
        </button>
      </div>
    );
  }

  return (
    <div className="text-center py-12">
      <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">No items found</h3>
      <p className="text-muted-foreground">
        {searchQuery 
          ? `No items match your search for "${searchQuery}"`
          : 'No items in this category'
        }
      </p>
    </div>
  );
}