"use client";

interface InventoryTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'all', label: 'All Items' },
  { id: 'active', label: 'Active' },
  { id: 'sold', label: 'Sold' }
];

export default function InventoryTabs({ activeTab, onTabChange }: InventoryTabsProps) {
  return (
    <div className="border-b border-[#1f1f1f] mb-6">
      <div className="flex -mb-px">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
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
  );
}