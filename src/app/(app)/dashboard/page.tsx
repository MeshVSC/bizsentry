
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import { getItems } from '@/lib/actions/itemActions';
import { Package, PackageCheck, DollarSign, Layers, TrendingUp } from 'lucide-react';
import type { Item } from '@/types/item';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

// Chart component imports for dashboard - using existing analytics charts for placeholder
import ItemsPerCategoryChart from '@/components/analytics/ItemsPerCategoryChart';
import type { ChartConfig } from '@/components/ui/chart';
import { format, parseISO } from 'date-fns';


export default async function DashboardPage() {
  const { items } = await getItems();

  const totalItemsInStorage = items.filter(item => !item.sold).reduce((sum, item) => sum + item.quantity, 0);
  const totalItemsSoldCount = items.filter(item => item.sold).length; 
  
  const categories = new Set(items.map(item => item.category).filter(Boolean));
  const numberOfCategories = categories.size;

  const totalValueInStorage = items.filter(item => !item.sold).reduce((sum, item) => sum + (item.salesPrice || 0) * item.quantity, 0);
  
  const totalEstimatedProfitSold = items
    .filter(item => item.sold && typeof item.salesPrice === 'number' && typeof item.originalPrice === 'number')
    .reduce((sum, item) => {
      const quantitySoldApproximation = item.quantity > 0 ? item.quantity : 1;
      const profitPerUnit = item.salesPrice! - item.originalPrice!;
      return sum + profitPerUnit * quantitySoldApproximation;
    }, 0);

  const recentlyAddedItems = [...items]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  // Placeholder data for a chart on the dashboard
  const categoriesData: { [key: string]: number } = {};
  items.filter(item => !item.sold).forEach(item => {
    const category = item.category || "Uncategorized";
    categoriesData[category] = (categoriesData[category] || 0) + item.quantity;
  });
  const itemsPerCategoryChartData = Object.entries(categoriesData).map(([name, count]) => ({ name, count })).slice(0, 5); // Show top 5
  const itemsPerCategoryChartConfig = {
    count: {
      label: "Items in Stock",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;


  return (
    <>
      <PageHeader title="Dashboard" description="Overview of your inventory." />
      {/* Metrics row: grid 4-column gap 24px */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6"> 
        <StatCard title="Total Items in Storage" value={totalItemsInStorage} icon={Package} description="Sum of quantities for all active items" />
        <StatCard title="Distinct Items Sold" value={totalItemsSoldCount} icon={PackageCheck} description="Number of unique item types marked as sold" />
        <StatCard title="Number of Categories" value={numberOfCategories} icon={Layers} description="Unique product categories" />
        <StatCard 
            title="Total Est. Profit (Sold)" 
            value={`$${totalEstimatedProfitSold.toFixed(2)}`} 
            icon={TrendingUp} 
            description="Approx. profit from items marked as sold" 
        />
      </div>

      {/* Chart row: full-width ChartCard + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
           <ItemsPerCategoryChart data={itemsPerCategoryChartData} chartConfig={itemsPerCategoryChartConfig} />
        </div>
        
        <Card className="shadow-lg"> {/* Recent Activity Card styled like MetricCard */}
          <CardHeader className="p-4">
            <CardTitle className="h2-style text-foreground">Recent Activity</CardTitle>
            <CardDescription className="text-muted-foreground">Overview of recent inventory changes.</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {recentlyAddedItems.length > 0 ? (
              <ul className="space-y-2">
                {recentlyAddedItems.map(item => (
                  <li key={item.id} className="flex items-center justify-between p-3 bg-background rounded-md shadow-sm">
                    <div>
                      <Link href={`/inventory/${item.id}`} className="font-medium text-primary hover:underline">{item.name}</Link>
                      <p className="text-xs text-muted-foreground">Added on {new Date(item.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className="text-sm text-foreground">{item.quantity} units</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No recent item additions.</p>
            )}
          </CardContent>
           <CardFooter className="p-4">
             <Button asChild>
               <Link href="/inventory/add">Add New Item</Link>
             </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
