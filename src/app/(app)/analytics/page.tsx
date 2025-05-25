
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import { getItems } from '@/lib/actions/itemActions';
import type { Item } from '@/types/item';
import { Package, PackageCheck, Layers, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { ChartConfig } from '@/components/ui/chart';
import ItemsPerCategoryChart from '@/components/analytics/ItemsPerCategoryChart';
import StockValueOverTimeChart from '@/components/analytics/StockValueOverTimeChart';
import SalesTrendsChart from '@/components/analytics/SalesTrendsChart';
import { format, parseISO } from 'date-fns';

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
  const refinedStockValueData: { date: string, value: number }[] = [];
  let currentTotalValue = 0;
  const itemsGroupedByDayForStockValue = new Map<string, number>();

  items.forEach(item => {
    const day = format(parseISO(item.createdAt), 'yyyy-MM-dd');
    const value = (item.originalPrice || 0) * item.quantity;
    itemsGroupedByDayForStockValue.set(day, (itemsGroupedByDayForStockValue.get(day) || 0) + value);
  });

  Array.from(itemsGroupedByDayForStockValue.keys())
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
    .forEach(day => {
      currentTotalValue += itemsGroupedByDayForStockValue.get(day)!;
      refinedStockValueData.push({
        date: format(parseISO(day), 'MMM dd'),
        value: currentTotalValue,
      });
    });

  const stockValueChartConfig = {
    value: {
      label: "Total Stock Value ($)",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig;

  // Data for Sales Trends Chart
  const salesByDay: { [key: string]: number } = {};
  items.filter(item => item.sold && item.salesPrice).forEach(item => {
    const saleDate = format(parseISO(item.updatedAt), 'yyyy-MM-dd'); // Use updatedAt as proxy for sale date
    const quantitySoldApproximation = item.quantity > 0 ? item.quantity : 1; // Assume last known quantity or 1
    const saleAmount = (item.salesPrice || 0) * quantitySoldApproximation;
    salesByDay[saleDate] = (salesByDay[saleDate] || 0) + saleAmount;
  });

  const salesTrendsChartData = Object.entries(salesByDay)
    .map(([date, totalSales]) => ({
      date: format(parseISO(date), 'MMM dd'),
      totalSales,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Ensure chronological order

  const salesTrendsChartConfig = {
    totalSales: {
      label: "Total Sales ($)",
      color: "hsl(var(--chart-3))",
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

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <ItemsPerCategoryChart data={itemsPerCategoryChartData} chartConfig={itemsPerCategoryChartConfig} />
        <StockValueOverTimeChart data={refinedStockValueData} chartConfig={stockValueChartConfig} />
      </div>
      
      <div className="grid gap-6 md:grid-cols-1"> {/* Sales Trend chart can take full width or be part of a new row */}
        <SalesTrendsChart data={salesTrendsChartData} chartConfig={salesTrendsChartConfig} />
      </div>
    </>
  );
}
