
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  description?: string;
  isLoading?: boolean;
}

export default function StatCard({ title, value, icon: Icon, description, isLoading = false }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </>
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
          </>
        )}
      </CardContent>
    </Card>
  );
}
