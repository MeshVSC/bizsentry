"use client";

import { useState, useMemo } from 'react';
import { Plus, Package, MoreHorizontal, Trash2 } from 'lucide-react';
import Link from 'next/link';
import InventorySearch from './InventorySearch';
import type { Item } from '@/types/item';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

interface SearchableInventoryListProps {
  items: Item[];
}

// TOCK-Style Inventory Item Component
function InventoryItem({ 
  item, 
  isSelectMode, 
  isSelected, 
  onToggleSelect 
}: { 
  item: Item;
  isSelectMode: boolean;
  isSelected: boolean;
  onToggleSelect: (itemId: string) => void;
}) {
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
    <div className="flex items-center justify-between p-3 rounded-lg border border-[#1f1f1f] hover:bg-[#0A0A0A] hover:border-[#ff9f43]/20 hover:shadow-[0_0_10px_rgba(255,159,67,0.1)] cursor-pointer group transition-all">
      <div className="flex items-center space-x-3">
        {isSelectMode && (
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggleSelect(item.id)}
            className="data-[state=checked]:bg-[#ff9f43] data-[state=checked]:border-[#ff9f43]"
          />
        )}
        <div className={`w-3 h-3 rounded-full ${getStatusDot(item.status)} ${getStatusGlow(item.status)} transition-all duration-300 group-hover:scale-110`} />
        <div className="min-w-0">
          <Link 
            href={`/inventory/${item.id}`}
            className="text-sm font-medium hover:text-[#ff9f43] transition-colors"
          >
            {item.name}
          </Link>
          {item.description && (
            <p className="text-xs text-muted-foreground truncate max-w-xs">
              {item.description}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-2">
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

export default function SearchableInventoryList({ items }: SearchableInventoryListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);

  const filteredItems = useMemo(() => {
    let filtered = items;
    
    // Filter by tab
    if (activeTab === 'active') {
      filtered = filtered.filter(item => item.status === 'in stock' || item.status === 'in use');
    } else if (activeTab === 'sold') {
      filtered = filtered.filter(item => item.status === 'sold');
    }
    
    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query) ||
        item.status.toLowerCase().includes(query) ||
        item.vendor?.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [items, searchQuery, activeTab]);

  // Batch operations
  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode);
    setSelectedItems(new Set());
  };

  const toggleSelectItem = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const selectAllItems = () => {
    if (selectedItems.size === filteredItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredItems.map(item => item.id)));
    }
  };

  const handleBatchDelete = async () => {
    if (selectedItems.size === 0) return;
    
    // TODO: Implement actual delete functionality
    console.log('Deleting items:', Array.from(selectedItems));
    alert(`Would delete ${selectedItems.size} items`);
    
    setSelectedItems(new Set());
    setIsSelectMode(false);
  };

  if (items.length === 0) {
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
    <div className="glass-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-6">
          <InventorySearch onSearch={setSearchQuery} />
          {searchQuery && (
            <p className="text-sm text-muted-foreground">
              {filteredItems.length} of {items.length} items
            </p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#1f1f1f] mb-6">
        <div className="flex -mb-px">
          {[
            { id: 'all', label: 'All Items' },
            { id: 'active', label: 'Active' },
            { id: 'sold', label: 'Sold' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-4 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-b-2 border-white text-white'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Items List */}
      {filteredItems.length === 0 ? (
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
      ) : (
        <div className="space-y-2">
          {/* Batch Actions Header */}
          {filteredItems.length > 0 && (
            <div className="flex items-center justify-between p-3 rounded-lg border border-[#1f1f1f] bg-[#0A0A0A]/50 mb-4">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleSelectMode}
                  className="border-[#ff9f43]/30 text-[#ff9f43] hover:bg-[#ff9f43]/10"
                >
                  {isSelectMode ? 'Cancel Select' : 'Select Items'}
                </Button>
                {isSelectMode && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={selectAllItems}
                    className="border-[#6b7280]/30 text-[#6b7280] hover:bg-[#6b7280]/10"
                  >
                    {selectedItems.size === filteredItems.length ? 'Deselect All' : 'Select All'}
                  </Button>
                )}
              </div>
              {isSelectMode && selectedItems.size > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBatchDelete}
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#ef4444',
                    boxShadow: '0 4px 16px rgba(239, 68, 68, 0.2)'
                  }}
                  className="transition-all duration-300 hover:scale-105 hover:bg-[rgba(239,68,68,0.2)] hover:border-[rgba(239,68,68,0.5)] hover:shadow-[0_6px_20px_rgba(239,68,68,0.3)]"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete {selectedItems.size} Items
                </Button>
              )}
            </div>
          )}
          
          {filteredItems.map((item) => (
            <InventoryItem 
              key={item.id} 
              item={item} 
              isSelectMode={isSelectMode}
              isSelected={selectedItems.has(item.id)}
              onToggleSelect={toggleSelectItem}
            />
          ))}
        </div>
      )}
    </div>
  );
}