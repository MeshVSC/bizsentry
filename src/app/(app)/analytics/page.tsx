
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import { getItems } from '@/lib/actions/itemActions';
import type { Item } from '@/types/item';
import { Package, PackageCheck, Layers, DollarSign, TrendingUp, Archive, PackageX, Building } from 'lucide-react';
import type { ChartConfig } from '@/components/ui/chart';
import ItemsPerCategoryChart from '@/components/analytics/ItemsPerCategoryChart';
import StockValueOverTimeChart from '@/components/analytics/StockValueOverTimeChart';
import SalesTrendsChart from '@/components/analytics/SalesTrendsChart';
import ProfitByCategoryChart from '@/components/analytics/ProfitByCategoryChart';
import { format, parseISO } from 'date-fns';

export default async function AnalyticsPage() {
  const { items } = await getItems(); 

  // KPI Calculations
  const totalUnitsInStock = items.filter(item => item.status === 'in stock').reduce((sum, item) => sum + item.quantity, 0);
  const totalUnitsInUse = items.filter(item => item.status === 'in use').reduce((sum, item) => sum + item.quantity, 0);
  const totalUnitsSold = items.filter(item => item.status === 'sold').reduce((sum, item) => sum + (item.quantity > 0 ? item.quantity : 1), 0); // Approximation

  const totalValueInStock = items.filter(item => item.status === 'in stock').reduce((sum, item) => sum + (item.originalPrice || 0) * item.quantity, 0);
  const totalValueInUse = items.filter(item => item.status === 'in use').reduce((sum, item) => sum + (item.originalPrice || 0) * item.quantity, 0);
  const totalValueSold = items.filter(item => item.status === 'sold').reduce((sum, item) => {
    const quantitySoldApproximation = item.quantity > 0 ? item.quantity : 1;
    return sum + (item.salesPrice || 0) * quantitySoldApproximation;
  }, 0);
  
  const categoriesWithStock = new Set(items.filter(item => item.status === 'in stock' || item.status === 'in use').map(item => item.category).filter(Boolean));
  const distinctItemTypesSoldCount = new Set(items.filter(item => item.status === 'sold').map(item => item.sku || item.name)).size;


  const categoriesData: { [key: string]: number } = {};
  items.filter(item => item.status === 'in stock' || item.status === 'in use').forEach(item => {
    const category = item.category || "Uncategorized";
    categoriesData[category] = (categoriesData[category] || 0) + item.quantity;
  });
  const itemsPerCategoryChartData = Object.entries(categoriesData).map(([name, count]) => ({ name, count }));
  const itemsPerCategoryChartConfig = { count: { label: "Items (In Stock/Use)", color: "hsl(var(--chart-1))" } } satisfies ChartConfig;
  

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
      refinedStockValueData.push({ date: format(parseISO(day), 'MMM dd'), value: currentTotalValue });
    });
  const stockValueChartConfig = { value: { label: "Total Stock Value ($)", color: "hsl(var(--chart-2))" } } satisfies ChartConfig;


  const salesByDay: { [key: string]: number } = {};
  items.filter(item => item.status === 'sold' && item.salesPrice && item.soldDate).forEach(item => {
    const saleDate = format(parseISO(item.soldDate!), 'yyyy-MM-dd');
    const quantitySoldApproximation = item.quantity > 0 ? item.quantity : 1; 
    const saleAmount = (item.salesPrice || 0) * quantitySoldApproximation;
    salesByDay[saleDate] = (salesByDay[saleDate] || 0) + saleAmount;
  });
  const salesTrendsChartData = Object.entries(salesByDay)
    .map(([date, totalSales]) => ({ date: format(parseISO(date), 'MMM dd'), totalSales }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); 
  const salesTrendsChartConfig = { totalSales: { label: "Total Sales ($)", color: "hsl(var(--chart-3))" } } satisfies ChartConfig;


  const profitByCategory: { [key: string]: number } = {};
  items.filter(item => item.status === 'sold' && typeof item.salesPrice === 'number' && typeof item.originalPrice === 'number')
    .forEach(item => {
      const profitPerUnit = item.salesPrice! - item.originalPrice!;
      const quantitySoldApproximation = item.quantity > 0 ? item.quantity : 1;
      const totalItemProfit = profitPerUnit * quantitySoldApproximation;
      const category = item.category || "Uncategorized";
      profitByCategory[category] = (profitByCategory[category] || 0) + totalItemProfit;
    });
  const profitByCategoryChartData = Object.entries(profitByCategory)
    .map(([name, profit]) => ({ name, profit }))
    .sort((a, b) => b.profit - a.profit); 
  const profitByCategoryChartConfig = { profit: { label: "Est. Profit ($)", color: "hsl(var(--chart-4))" } } satisfies ChartConfig;
  const totalEstimatedProfit = Object.values(profitByCategory).reduce((sum, profit) => sum + profit, 0);


  return (
    <>
      <PageHeader title="Inventory Analytics" description="Detailed insights into your stock." />
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-8">
        <StatCard title="Units In Stock" value={totalUnitsInStock} icon={Package} description="Total quantity of items 'in stock'" />
        <StatCard title="Units In Use" value={totalUnitsInUse} icon={Archive} description="Total quantity of items 'in use'" />
        <StatCard title="Units Sold" value={totalUnitsSold} icon={PackageX} description="Total quantity of items 'sold' (approx.)" />
        <StatCard title="Value In Stock" value={`$${totalValueInStock.toFixed(2)}`} icon={DollarSign} description="Est. purchase value of 'in stock' items" />
        <StatCard title="Value In Use" value={`$${totalValueInUse.toFixed(2)}`} icon={DollarSign} description="Est. purchase value of 'in use' items" />
        <StatCard title="Value Sold" value={`$${totalValueSold.toFixed(2)}`} icon={TrendingUp} description="Est. sales value of 'sold' items" />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard title="Items (In Stock/Use)" value={items.filter(i => i.status === 'in stock' || i.status === 'in use').reduce((s,i) => s+i.quantity,0)} icon={Package} description="Sum of quantities for active items" />
        <StatCard title="Distinct Item Types Sold" value={distinctItemTypesSoldCount} icon={PackageCheck} description="Unique item SKUs marked as 'sold'" />
        <StatCard title="Categories with Stock" value={categoriesWithStock.size} icon={Layers} description="Unique categories with 'in stock' or 'in use' items" />
        <StatCard title="Total Est. Profit (Sold)" value={`$${totalEstimatedProfit.toFixed(2)}`} icon={TrendingUp} description="Approx. profit from 'sold' items" />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <ItemsPerCategoryChart data={itemsPerCategoryChartData} chartConfig={itemsPerCategoryChartConfig} />
        <StockValueOverTimeChart data={refinedStockValueData} chartConfig={stockValueChartConfig} description="Cumulative value of inventory added (based on purchase price)." />
        <ProfitByCategoryChart data={profitByCategoryChartData} chartConfig={profitByCategoryChartConfig} />
      </div>
      
      <div className="grid gap-6 md:grid-cols-1">
        <SalesTrendsChart data={salesTrendsChartData} chartConfig={salesTrendsChartConfig} />
      </div>
    </>
  );
}
