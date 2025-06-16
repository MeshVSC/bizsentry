"use client";

import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BatchActionsProps {
  isSelectMode: boolean;
  selectedCount: number;
  totalCount: number;
  onToggleSelectMode: () => void;
  onSelectAll: () => void;
  onBatchDelete: () => void;
}

export default function BatchActions({
  isSelectMode,
  selectedCount,
  totalCount,
  onToggleSelectMode,
  onSelectAll,
  onBatchDelete,
}: BatchActionsProps) {
  if (totalCount === 0) return null;

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-[#1f1f1f] bg-[#0A0A0A]/50 mb-4">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleSelectMode}
          className="border-[#ff9f43]/30 text-[#ff9f43] hover:bg-[#ff9f43]/10"
        >
          {isSelectMode ? 'Cancel Select' : 'Select Items'}
        </Button>
        {isSelectMode && (
          <Button
            variant="outline"
            size="sm"
            onClick={onSelectAll}
            className="border-[#6b7280]/30 text-[#6b7280] hover:bg-[#6b7280]/10"
          >
            {selectedCount === totalCount ? 'Deselect All' : 'Select All'}
          </Button>
        )}
      </div>
      {isSelectMode && selectedCount > 0 && (
        <Button
          variant="outline"
          size="sm"
          onClick={onBatchDelete}
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
          Delete {selectedCount} Items
        </Button>
      )}
    </div>
  );
}