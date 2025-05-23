
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import { getItems } from '@/lib/actions/itemActions';
import type { Item } from '@/types/item';
import { Package, PackageCheck, Layers, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { ChartConfig } from '@/components/ui/chart';
import ItemsPerCategoryChart from '@/components/analytics/ItemsPerCategoryChart';

export default async function AnalyticsPage() {
  const items = await getItems();

  // KPI Calculations
  const totalItemsInStorage = items.filter(item => !item.sold).reduce((sum, item) => sum + item.quantity, 0);
  const totalItemsSoldCount = items.filter(item => item.sold).length; // Number of distinct item types marked as sold
  
  const categoriesData: { [key: string]: number } = {};
  // Calculate count of UNSOLD items per category for the chart
  items.filter(item => !item.sold).forEach(item => {
    const category = item.category || "Uncategorized";
    categoriesData[category] = (categoriesData[category] || 0) + item.quantity;
  });

  const itemsPerCategoryChartData = Object.entries(categoriesData).map(([name, count]) => ({ name, count }));

  const chartConfig = {
    count: {
      label: "Items in Stock", // Updated label to be more specific
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;
  
  const totalValueSold = items.filter(item => item.sold).reduce((sum, item) => {
    // This is an approximation:
    // If item.quantity > 0, it's assumed this was the quantity sold.
    // If item.quantity === 0, it's assumed 1 unit was sold.
    const quantitySoldApproximation = item.quantity > 0 ? item.quantity : 1;
    return sum + (item.salesPrice || 0) * quantitySoldApproximation;
  }, 0);


  return (
    <>
      <PageHeader title="Inventory Analytics" description="Detailed insights into your stock." />
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard title="Total Items in Storage" value={totalItemsInStorage} icon={Package} description="Sum of quantities for all unsold items" />
        <StatCard title="Distinct Item Types Sold" value={totalItemsSoldCount} icon={PackageCheck} description="Number of unique item SKUs marked as sold" />
        <StatCard title="Categories with Stock" value={Object.keys(categoriesData).length} icon={Layers} description="Unique categories with unsold items" />
        <StatCard 
          title="Est. Value of Sold Items" 
          value={`$${totalValueSold.toFixed(2)}`} 
          icon={DollarSign} 
          description="Approx. value based on sales price & assumed sold quantity" 
        />
      </div>

      <ItemsPerCategoryChart data={itemsPerCategoryChartData} chartConfig={chartConfig} />

      {/* Placeholder for more charts/analytics */}
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Stock Value Over Time (Placeholder)</CardTitle></CardHeader>
          <CardContent className="h-[200px] flex items-center justify-center text-muted-foreground">
            Line chart coming soon...
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Sales Trends (Placeholder)</CardTitle></CardHeader>
          <CardContent className="h-[200px] flex items-center justify-center text-muted-foreground">
            Sales data visualization coming soon...
          </CardContent>
        </Card>
      </div>
    </>
  );
}
