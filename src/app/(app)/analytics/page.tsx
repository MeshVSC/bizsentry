
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import { getItems } from '@/lib/actions/itemActions';
import { Package, PackageCheck, Layers, DollarSign, TrendingUp, Archive, PackageX } from 'lucide-react';
import type { ChartConfig } from '@/components/ui/chart';
import ItemsPerCategoryChart from '@/components/analytics/ItemsPerCategoryChart';
import StockValueOverTimeChart from '@/components/analytics/StockValueOverTimeChart';
import SalesTrendsChart from '@/components/analytics/SalesTrendsChart';
import ProfitByCategoryChart from '@/components/analytics/ProfitByCategoryChart';
import { format, parseISO, isValid } from 'date-fns';

export default async function AnalyticsPage() {
  const { items } = await getItems(); 

  // Initialize accumulators
  let totalUnitsInStock = 0;
  let totalUnitsInUse = 0;
  let totalUnitsSold = 0;
  let totalValueInStock = 0;
  let totalValueInUse = 0;
  let totalValueSold = 0;
  
  const categoriesWithStock = new Set<string>();
  const distinctItemTypesSoldCount = new Set<string>();
  
  const itemsPerCategoryDataMap = new Map<string, number>();
  const stockValueByCreationDayMap = new Map<string, number>();
  const salesByDayMap = new Map<string, number>();
  const profitByCategoryMap = new Map<string, number>();

  // Single pass to aggregate data
  items.forEach(item => {
    // KPIs by status
    if (item.status === 'in stock') {
      totalUnitsInStock += item.quantity;
      totalValueInStock += (item.originalPrice || 0) * item.quantity;
      if (item.category) categoriesWithStock.add(item.category);
      
      const categoryName = item.category || "Uncategorized";
      itemsPerCategoryDataMap.set(categoryName, (itemsPerCategoryDataMap.get(categoryName) || 0) + item.quantity);

    } else if (item.status === 'in use') {
      totalUnitsInUse += item.quantity;
      totalValueInUse += (item.originalPrice || 0) * item.quantity;
      if (item.category) categoriesWithStock.add(item.category);
      
      const categoryName = item.category || "Uncategorized";
      itemsPerCategoryDataMap.set(categoryName, (itemsPerCategoryDataMap.get(categoryName) || 0) + item.quantity);

    } else if (item.status === 'sold') {
      const quantitySoldApproximation = item.quantity > 0 ? item.quantity : 1;
      totalUnitsSold += quantitySoldApproximation;
      totalValueSold += (item.salesPrice || 0) * quantitySoldApproximation;
      distinctItemTypesSoldCount.add(item.sku || item.name);

      // Sales Trends Data
      if (item.salesPrice && item.soldDate && typeof item.soldDate === 'string') {
        const parsedSoldDate = parseISO(item.soldDate);
        if (isValid(parsedSoldDate)) {
          const saleDateKey = format(parsedSoldDate, 'yyyy-MM-dd');
          const saleAmount = (item.salesPrice || 0) * quantitySoldApproximation;
          salesByDayMap.set(saleDateKey, (salesByDayMap.get(saleDateKey) || 0) + saleAmount);
        }
      }

      // Profit by Category Data
      if (typeof item.salesPrice === 'number' && typeof item.originalPrice === 'number') {
        const profitPerUnit = item.salesPrice - item.originalPrice;
        const totalItemProfit = profitPerUnit * quantitySoldApproximation;
        const categoryName = item.category || "Uncategorized";
        profitByCategoryMap.set(categoryName, (profitByCategoryMap.get(categoryName) || 0) + totalItemProfit);
      }
    }

    // Stock Value Over Time Data
    if (item.createdAt && typeof item.createdAt === 'string') {
      const parsedCreatedDate = parseISO(item.createdAt);
      if (isValid(parsedCreatedDate)) {
        const creationDayKey = format(parsedCreatedDate, 'yyyy-MM-dd');
        const itemValue = (item.originalPrice || 0) * item.quantity;
        stockValueByCreationDayMap.set(creationDayKey, (stockValueByCreationDayMap.get(creationDayKey) || 0) + itemValue);
      }
    }
  });

  // Prepare chart data from aggregated maps
  const itemsPerCategoryChartData = Array.from(itemsPerCategoryDataMap.entries()).map(([name, count]) => ({ name, count }));
  const itemsPerCategoryChartConfig = { count: { label: "Items (In Stock/Use)", color: "hsl(var(--chart-1))" } } satisfies ChartConfig;

  let cumulativeStockValue = 0;
  const refinedStockValueData = Array.from(stockValueByCreationDayMap.keys())
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
    .map(dayKey => {
      cumulativeStockValue += stockValueByCreationDayMap.get(dayKey)!;
      return { date: format(parseISO(dayKey), 'MMM dd'), value: cumulativeStockValue };
    });
  const stockValueChartConfig = { value: { label: "Total Stock Value ($)", color: "hsl(var(--chart-2))" } } satisfies ChartConfig;

  const salesTrendsChartData = Array.from(salesByDayMap.entries())
    .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
    .map(([dateKey, totalSales]) => ({ date: format(parseISO(dateKey), 'MMM dd'), totalSales }));
  const salesTrendsChartConfig = { totalSales: { label: "Total Sales ($)", color: "hsl(var(--chart-3))" } } satisfies ChartConfig;

  const profitByCategoryChartData = Array.from(profitByCategoryMap.entries())
    .map(([name, profit]) => ({ name, profit }))
    .sort((a, b) => b.profit - a.profit);
  const profitByCategoryChartConfig = { profit: { label: "Est. Profit ($)", color: "hsl(var(--chart-4))" } } satisfies ChartConfig;
  
  const totalEstimatedProfit = Array.from(profitByCategoryMap.values()).reduce((sum, profit) => sum + profit, 0);
  const totalActiveItemsQuantity = items.filter(i => i.status === 'in stock' || i.status === 'in use').reduce((s,i) => s+i.quantity,0);

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
        <StatCard title="Items (In Stock/Use)" value={totalActiveItemsQuantity} icon={Package} description="Sum of quantities for active items" />
        <StatCard title="Distinct Item Types Sold" value={distinctItemTypesSoldCount.size} icon={PackageCheck} description="Unique item SKUs marked as 'sold'" />
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
