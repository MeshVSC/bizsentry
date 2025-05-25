
"use client";

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from '@/components/ui/card';
import { FilterX, Search } from 'lucide-react';

interface InventoryFiltersProps {
  currentNameFilter: string;
  currentCategoryFilter: string;
  allCategories: string[];
}

export default function InventoryFilters({
  currentNameFilter,
  currentCategoryFilter,
  allCategories,
}: InventoryFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [name, setName] = useState(currentNameFilter);
  const [category, setCategory] = useState(currentCategoryFilter);

  useEffect(() => {
    setName(currentNameFilter);
    setCategory(currentCategoryFilter);
  }, [currentNameFilter, currentCategoryFilter]);

  const handleApplyFilters = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (name) {
      params.set('name', name);
    }
    if (category) {
      params.set('category', category);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleClearFilters = () => {
    setName('');
    setCategory('');
    router.push(pathname);
  };

  return (
    <Card className="mb-6 shadow">
      <CardContent className="pt-6">
        <form onSubmit={handleApplyFilters} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
          <div className="space-y-1">
            <label htmlFor="name-filter" className="text-sm font-medium">Filter by Name</label>
            <Input
              id="name-filter"
              placeholder="Search by item name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="category-filter" className="text-sm font-medium">Filter by Category</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category-filter" className="w-full">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {allCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-end gap-2 col-span-1 sm:col-span-2 md:col-span-1 lg:col-auto pt-3 sm:pt-0">
            <Button type="submit" className="w-full sm:w-auto">
              <Search className="mr-2 h-4 w-4" /> Apply Filters
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleClearFilters}
              className="w-full sm:w-auto"
              disabled={!currentNameFilter && !currentCategoryFilter}
            >
              <FilterX className="mr-2 h-4 w-4" /> Clear
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
