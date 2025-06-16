"use client";

import InventorySearch from '../InventorySearch';

interface InventoryHeaderProps {
  searchQuery: string;
  onSearch: (query: string) => void;
  filteredCount: number;
  totalCount: number;
}

export default function InventoryHeader({
  searchQuery,
  onSearch,
  filteredCount,
  totalCount,
}: InventoryHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-6">
        <InventorySearch onSearch={onSearch} />
        {searchQuery && (
          <p className="text-sm text-muted-foreground">
            {filteredCount} of {totalCount} items
          </p>
        )}
      </div>
    </div>
  );
}