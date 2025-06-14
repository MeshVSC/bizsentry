"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Package } from 'lucide-react';
import Link from 'next/link';
import InventorySearch from './InventorySearch';
import type { Item } from '@/types/item';

interface SearchableInventoryListProps {
  items: Item[];
}

export default function SearchableInventoryList({ items }: SearchableInventoryListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    
    const query = searchQuery.toLowerCase();
    return items.filter(item => 
      item.name.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query) ||
      item.category?.toLowerCase().includes(query) ||
      item.status.toLowerCase().includes(query) ||
      item.vendor?.toLowerCase().includes(query)
    );
  }, [items, searchQuery]);

  if (items.length === 0) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border p-12 text-center bg-muted/5">
          <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <Package className="h-10 w-10 text-primary/60" />
          </div>
          <h3 className="text-xl font-semibold mb-3">No Inventory Items</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-8">
            You haven&apos;t added any items yet. Get started by adding your first item to begin managing your inventory.
          </p>
          <Button asChild className="hover:scale-105 transition-transform">
            <Link href="/inventory/add">
              <Plus className="mr-2 h-4 w-4" />
              Add First Item
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <InventorySearch onSearch={setSearchQuery} />
        {searchQuery && (
          <p className="text-sm text-muted-foreground">
            {filteredItems.length} of {items.length} items
          </p>
        )}
      </div>

      {filteredItems.length === 0 ? (
        <div className="text-center py-8">
          <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No items found</h3>
          <p className="text-muted-foreground">
            No items match your search for &ldquo;{searchQuery}&rdquo;
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <Card key={item.id} className="group hover:shadow-lg transition-all duration-200 border hover:border-primary/20 bg-card/95">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-base">
                  <span className="truncate font-semibold group-hover:text-primary transition-colors">{item.name}</span>
                  <span className="text-sm font-medium text-muted-foreground bg-muted/60 px-2 py-1 rounded-md">
                    {item.quantity}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {item.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between pt-2">
                    <span className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                      item.status === 'in stock' ? 'bg-green-100 text-green-700 group-hover:bg-green-200' :
                      item.status === 'in use' ? 'bg-blue-100 text-blue-700 group-hover:bg-blue-200' :
                      'bg-red-100 text-red-700 group-hover:bg-red-200'
                    }`}>
                      {item.status}
                    </span>
                    <Button asChild variant="outline" size="sm" className="hover:bg-primary hover:text-primary-foreground transition-colors">
                      <Link href={`/inventory/${item.id}`}>
                        View Item
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}