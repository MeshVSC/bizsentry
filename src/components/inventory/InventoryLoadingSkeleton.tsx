import { Skeleton } from '@/components/ui/skeleton';

export default function InventoryLoadingSkeleton() {
  return (
    <div className="glass-card p-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-10 w-64 bg-[#1f1f1f]" />
        <Skeleton className="h-4 w-32 bg-[#1f1f1f]" />
      </div>

      {/* Tabs Skeleton */}
      <div className="border-b border-[#1f1f1f] mb-6">
        <div className="flex gap-8 -mb-px">
          <Skeleton className="h-4 w-20 bg-[#1f1f1f]" />
          <Skeleton className="h-4 w-16 bg-[#1f1f1f]" />
          <Skeleton className="h-4 w-12 bg-[#1f1f1f]" />
        </div>
      </div>

      {/* Items List Skeleton */}
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-[#1f1f1f]">
            <div className="flex items-center space-x-3">
              <Skeleton className="w-3 h-3 rounded-full bg-[#1f1f1f]" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-32 bg-[#1f1f1f]" />
                <Skeleton className="h-3 w-48 bg-[#1f1f1f]" />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Skeleton className="h-5 w-16 rounded-full bg-[#1f1f1f]" />
              <Skeleton className="h-4 w-12 bg-[#1f1f1f]" />
              <Skeleton className="w-4 h-4 bg-[#1f1f1f]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}