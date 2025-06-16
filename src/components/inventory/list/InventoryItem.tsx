"use client";

import { MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import type { Item } from '@/types/item';
import { Checkbox } from '@/components/ui/checkbox';

interface InventoryItemProps {
  item: Item;
  isSelectMode: boolean;
  isSelected: boolean;
  onToggleSelect: (itemId: string) => void;
}

export default function InventoryItem({ 
  item, 
  isSelectMode, 
  isSelected, 
  onToggleSelect 
}: InventoryItemProps) {
  const getStatusDot = (status: string) => {
    switch (status) {
      case 'in stock': return 'bg-[#27ae60] shadow-[0_0_8px_rgba(39,174,96,0.4)]';
      case 'in use': return 'bg-[#ffeb3b] shadow-[0_0_8px_rgba(255,235,59,0.4)]';
      case 'sold': return 'bg-[#e74c3c] shadow-[0_0_8px_rgba(231,76,60,0.4)]';
      default: return 'bg-[#6b7280]';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in stock': return 'bg-[#111111] text-[#27ae60]';
      case 'in use': return 'bg-[#111111] text-[#ffeb3b]';
      case 'sold': return 'bg-[#111111] text-[#e74c3c]';
      default: return 'bg-[#111111] text-muted-foreground';
    }
  };

  const getStatusGlow = (status: string) => {
    switch (status) {
      case 'in stock': return 'group-hover:shadow-[0_0_15px_rgba(39,174,96,0.8)]';
      case 'in use': return 'group-hover:shadow-[0_0_15px_rgba(255,235,59,0.8)]';
      case 'sold': return 'group-hover:shadow-[0_0_15px_rgba(231,76,60,0.8)]';
      default: return '';
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 rounded-lg border border-[#1f1f1f] hover:bg-[#0A0A0A] hover:border-[#ff9f43]/20 hover:shadow-[0_0_10px_rgba(255,159,67,0.1)] cursor-pointer group transition-all space-y-2 sm:space-y-0">
      <div className="flex items-center space-x-3 min-w-0 flex-1">
        {isSelectMode && (
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggleSelect(item.id)}
            className="data-[state=checked]:bg-[#ff9f43] data-[state=checked]:border-[#ff9f43] flex-shrink-0"
          />
        )}
        <div className={`w-3 h-3 rounded-full ${getStatusDot(item.status)} ${getStatusGlow(item.status)} transition-all duration-300 group-hover:scale-110 flex-shrink-0`} />
        <div className="min-w-0 flex-1">
          <Link 
            href={`/inventory/${item.id}`}
            className="text-sm font-medium hover:text-[#ff9f43] transition-colors block"
          >
            {item.name}
          </Link>
          {item.description && (
            <p className="text-xs text-muted-foreground truncate">
              {item.description}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between sm:justify-end space-x-2 sm:flex-shrink-0">
        <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadge(item.status)} ${getStatusGlow(item.status)} capitalize transition-all duration-300 group-hover:scale-105`}>
          {item.status}
        </span>
        <span className="text-xs text-muted-foreground">
          {item.quantity} units
        </span>
        <button className="text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}