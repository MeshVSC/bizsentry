"use client";

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface FloatingActionButtonProps {
  href: string;
  icon?: React.ReactNode;
  className?: string;
  title?: string;
}

export default function FloatingActionButton({ 
  href, 
  icon = <Plus className="h-6 w-6" />, 
  className,
  title = "Add new item"
}: FloatingActionButtonProps) {
  return (
    <Button
      asChild
      size="lg"
      className={cn(
        "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-50",
        "bg-primary hover:bg-primary/90 text-primary-foreground",
        className
      )}
      title={title}
    >
      <Link href={href}>
        {icon}
      </Link>
    </Button>
  );
}