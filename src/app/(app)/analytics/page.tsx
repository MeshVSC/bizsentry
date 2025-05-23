
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import { getItems } from '@/lib/actions/itemActions';
import type { Item } from '@/types/item';
import { Package, PackageCheck, Layers, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
// Removed direct recharts imports, they are now in the client component
import type { ChartConfig } from '@/components/ui/chart';
import ItemsPerCategoryChart from '@/components/analytics/ItemsPerCategoryChart'; // New Import

// The CustomTooltip component was defined here but not used by the BarChart;
// ChartTooltipContent from shadcn/ui/chart is used instead.
// It has been removed.

export default async function AnalyticsPage() {
  const items = await getItems();

  // KPI Calculations
  const totalItemsInStorage = items.filter(item => !item.sold).reduce((sum, item) => sum + item.quantity, 0);
  const totalItemsSoldCount = items.filter(item => item.sold).length;
  
  const categoriesData: { [key: string]: number } = {};
  items.forEach(item => {
    const category = item.category || "Uncategorized";
    categoriesData[category] = (categoriesData[category] || 0) + item.quantity;
  });

  const itemsPerCategoryChartData = Object.entries(categoriesData).map(([name, count]) => ({ name, count }));

  const chartConfig = {
    count: {
      label: "Items",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;
  
  const totalValueSold = items.filter(item => item.sold).reduce((sum, item) => {
    // Assuming sold items quantity was 1 or their last known quantity before being marked sold.
    // This needs more robust logic if partial quantities are sold.
    // For now, let's sum salesPrice * quantity if item is sold (assuming quantity reflects units sold before marking the SKU sold)
    // Or just sum salesPrice if quantity means current stock.
    // Let's assume 'sold' means the entire listing is sold.
    return sum + (item.salesPrice || 0) * (item.quantity > 0 ? item.quantity : 1); // Approximation
  }, 0);


  return (
    <>
      <PageHeader title="Inventory Analytics" description="Detailed insights into your stock." />
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard title="Total Items in Storage" value={totalItemsInStorage} icon={Package} />
        <StatCard title="Distinct Items Sold" value={totalItemsSoldCount} icon={PackageCheck} />
        <StatCard title="Number of Categories" value={Object.keys(categoriesData).length} icon={Layers} />
        <StatCard title="Est. Value of Sold Items" value={`$${totalValueSold.toFixed(2)}`} icon={DollarSign} description="Based on sales price of sold items" />
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
