
"use client";

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  itemsPerPage: number;
}

export default function PaginationControls({ 
  currentPage, 
  totalPages, 
  totalCount, 
  itemsPerPage 
}: PaginationControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createPageURL = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      router.push(createPageURL(currentPage - 1));
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      router.push(createPageURL(currentPage + 1));
    }
  };

  if (totalCount === 0 || totalPages <= 1 && currentPage === 1) { // Also hide if only one page and it's the current one
    return null; 
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalCount);

  return (
    <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 py-4 border-t">
      <p className="text-sm text-muted-foreground">
        Showing {startItem}-{endItem} of {totalCount} item(s)
      </p>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevious}
          disabled={currentPage <= 1}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Previous
        </Button>
        <span className="text-sm font-medium px-2 py-1 rounded-md border">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          disabled={currentPage >= totalPages}
        >
          Next
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

```