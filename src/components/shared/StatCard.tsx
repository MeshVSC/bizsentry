
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Card already uses bg-card
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
    // Card component already applies bg-card, rounded-lg, border. Adding shadow-lg and ensuring p-4 overall.
    <Card className="shadow-lg"> 
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4"> {/* Ensure padding 16px (p-4) */}
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle> {/* text-sm, Text Mid */}
        {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
      </CardHeader>
      <CardContent className="p-4 pt-0"> {/* Ensure padding 16px (p-4) for content part */}
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-3/4 mb-2 bg-muted/50" />
            <Skeleton className="h-4 w-1/2 bg-muted/50" />
          </>
        ) : (
          <>
            <div className="text-2xl font-semibold text-foreground">{value}</div> {/* text-2xl, semibold, Text Light */}
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
          </>
        )}
      </CardContent>
    </Card>
  );
}
