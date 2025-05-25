
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import { getItems } from '@/lib/actions/itemActions';
import type { Item } from '@/types/item';
import { Package, PackageCheck, Layers, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { ChartConfig } from '@/components/ui/chart';
import ItemsPerCategoryChart from '@/components/analytics/ItemsPerCategoryChart';
import StockValueOverTimeChart from '@/components/analytics/StockValueOverTimeChart';
import { format } from 'date-fns';

export default async function AnalyticsPage() {
  const items = await getItems();

  // KPI Calculations
  const totalItemsInStorage = items.filter(item => !item.sold).reduce((sum, item) => sum + item.quantity, 0);
  const totalItemsSoldCount = items.filter(item => item.sold).length; 
  
  const categoriesData: { [key: string]: number } = {};
  items.filter(item => !item.sold).forEach(item => {
    const category = item.category || "Uncategorized";
    categoriesData[category] = (categoriesData[category] || 0) + item.quantity;
  });

  const itemsPerCategoryChartData = Object.entries(categoriesData).map(([name, count]) => ({ name, count }));

  const itemsPerCategoryChartConfig = {
    count: {
      label: "Items in Stock",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;
  
  const totalValueSold = items.filter(item => item.sold).reduce((sum, item) => {
    const quantitySoldApproximation = item.quantity > 0 ? item.quantity : 1;
    return sum + (item.salesPrice || 0) * quantitySoldApproximation;
  }, 0);

  // Data for Stock Value Over Time Chart
  const sortedItemsByDate = [...items].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  let cumulativeValue = 0;
  const stockValueOverTimeData = sortedItemsByDate.map(item => {
    cumulativeValue += (item.originalPrice || 0) * item.quantity;
    return {
      date: format(new Date(item.createdAt), 'MMM dd'), // Format date for display
      value: cumulativeValue,
      itemName: item.name, // For tooltip
    };
  });
  
  // To avoid too many data points if items are created very close together,
  // we can consolidate to daily max cumulative value or a similar strategy if needed.
  // For now, using each item's creation as a point.
  const uniqueDateStockValues: { date: string; value: number; itemsAdded: string[] }[] = [];
  const dateMap = new Map<string, { value: number; items: string[] }>();

  sortedItemsByDate.forEach(item => {
    const dateStr = format(new Date(item.createdAt), 'yyyy-MM-dd');
    const itemValue = (item.originalPrice || 0) * item.quantity;

    if (!dateMap.has(dateStr)) {
      const previousDate = uniqueDateStockValues.length > 0 ? uniqueDateStockValues[uniqueDateStockValues.length - 1].date : null;
      const previousValue = previousDate && dateMap.get(previousDate) ? dateMap.get(previousDate)!.value : 0;
      dateMap.set(dateStr, { value: previousValue + itemValue, items: [item.name] });
    } else {
      const currentEntry = dateMap.get(dateStr)!;
      currentEntry.value += itemValue;
      currentEntry.items.push(item.name);
    }
  });
  
  let runningTotal = 0;
  const finalStockValueData = Array.from(dateMap.entries())
    .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
    .map(([dateStr, data]) => {
      runningTotal += data.value - (uniqueDateStockValues.length > 0 ? dateMap.get(uniqueDateStockValues[uniqueDateStockValues.length -1].date)?.value || 0 : 0) ;
      
      // Better approach: accumulate based on item additions
      // This part is complex with the current structure of dateMap, let's simplify.
      // For this iteration, we'll use the simpler stockValueOverTimeData and address detailed daily cumulative if needed.
      // The simpler stockValueOverTimeData plots each item addition and its impact on cumulative value.

      return {
          date: format(new Date(dateStr), 'MMM dd'), // Re-format for chart
          value: data.value, // This `data.value` already accumulates if multiple items on same day
          // For a true running total, it needs to sum from previous days.
      };
  });

  // Recalculate stockValueOverTimeData for a smoother line (cumulative)
  const refinedStockValueData: { date: string, value: number }[] = [];
  let currentTotalValue = 0;
  const itemsGroupedByDay = new Map<string, number>();

  // Sum values for items created on the same day
  items.forEach(item => {
    const day = format(new Date(item.createdAt), 'yyyy-MM-dd');
    const value = (item.originalPrice || 0) * item.quantity;
    itemsGroupedByDay.set(day, (itemsGroupedByDay.get(day) || 0) + value);
  });

  // Create cumulative data points
  Array.from(itemsGroupedByDay.keys())
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
    .forEach(day => {
      currentTotalValue += itemsGroupedByDay.get(day)!;
      refinedStockValueData.push({
        date: format(new Date(day), 'MMM dd'),
        value: currentTotalValue,
      });
    });


  const stockValueChartConfig = {
    value: {
      label: "Total Stock Value ($)",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig;


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

      <div className="grid gap-6 md:grid-cols-2">
        <ItemsPerCategoryChart data={itemsPerCategoryChartData} chartConfig={itemsPerCategoryChartConfig} />
        <StockValueOverTimeChart data={refinedStockValueData} chartConfig={stockValueChartConfig} />
      </div>

      {/* Placeholder for more charts/analytics */}
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {/* StockValueOverTimeChart moved up */}
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
