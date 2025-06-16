"use client";

import { useState, useMemo } from 'react';
import type { Item } from '@/types/item';
import InventoryHeader from './InventoryHeader';
import InventoryTabs from './InventoryTabs';
import BatchActions from './BatchActions';
import InventoryItem from './InventoryItem';
import EmptyState from './EmptyState';

interface InventoryListContainerProps {
  items: Item[];
}

export default function InventoryListContainer({ items }: InventoryListContainerProps) {
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

  // Show empty state if no items exist
  if (items.length === 0) {
    return <EmptyState isNoItems={true} />;
  }

  return (
    <div className="glass-card p-6">
      <InventoryHeader
        searchQuery={searchQuery}
        onSearch={setSearchQuery}
        filteredCount={filteredItems.length}
        totalCount={items.length}
      />

      <InventoryTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {filteredItems.length === 0 ? (
        <EmptyState isNoItems={false} searchQuery={searchQuery} />
      ) : (
        <div className="space-y-2">
          <BatchActions
            isSelectMode={isSelectMode}
            selectedCount={selectedItems.size}
            totalCount={filteredItems.length}
            onToggleSelectMode={toggleSelectMode}
            onSelectAll={selectAllItems}
            onBatchDelete={handleBatchDelete}
          />
          
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