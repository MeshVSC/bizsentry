
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
    <Card className="shadow-lg hover:bg-[#0A0A0A] hover:border-[#ff9f43]/20 hover:shadow-[0_0_15px_rgba(255,159,67,0.3)] cursor-pointer group transition-all duration-300"> 
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {Icon && (
          <Icon 
            className="h-5 w-5 transition-all duration-300 group-hover:scale-110" 
            style={{
              color: '#ff9f43',
              filter: 'drop-shadow(0 0 8px rgba(255, 159, 67, 0.6))'
            }}
          />
        )}
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-3/4 mb-2 bg-muted/50" />
            <Skeleton className="h-4 w-1/2 bg-muted/50" />
          </>
        ) : (
          <>
            <div className="text-2xl font-semibold text-foreground">{value}</div>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
          </>
        )}
      </CardContent>
    </Card>
  );
}
