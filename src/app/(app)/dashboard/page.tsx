
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import { getItems } from '@/lib/actions/itemActions';
import { Package, PackageCheck, DollarSign, Layers } from 'lucide-react';
import type { Item } from '@/types/item';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default async function DashboardPage() {
  const items = await getItems();

  const totalItemsInStorage = items.filter(item => !item.sold).reduce((sum, item) => sum + item.quantity, 0);
  const totalItemsSoldCount = items.filter(item => item.sold).length; // Counts distinct item types marked as sold.
                                                                       // Or, if quantity sold is tracked per item, sum that.
                                                                       // For now, using the 'sold' flag.
  
  const categories = new Set(items.map(item => item.category).filter(Boolean));
  const numberOfCategories = categories.size;

  const totalValueInStorage = items.filter(item => !item.sold).reduce((sum, item) => sum + (item.salesPrice || 0) * item.quantity, 0);
  
  const recentlyAddedItems = [...items]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  return (
    <>
      <PageHeader title="Dashboard" description="Overview of your inventory." />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Items in Storage" value={totalItemsInStorage} icon={Package} description="Sum of quantities for all active items" />
        <StatCard title="Distinct Items Sold" value={totalItemsSoldCount} icon={PackageCheck} description="Number of unique item types marked as sold" />
        <StatCard title="Number of Categories" value={numberOfCategories} icon={Layers} description="Unique product categories" />
        <StatCard title="Est. Value in Storage" value={`$${totalValueInStorage.toFixed(2)}`} icon={DollarSign} description="Based on sales price" />
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Overview of recent inventory changes.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentlyAddedItems.length > 0 ? (
              <ul className="space-y-3">
                {recentlyAddedItems.map(item => (
                  <li key={item.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-md shadow-sm">
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
           <CardFooter>
             <Link href="/inventory/add" passHref>
                <Button>Add New Item</Button>
             </Link>
          </CardFooter>
        </Card>
        
        <Card className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-primary/10 to-accent/10">
            <Image src="https://placehold.co/300x200.png?text=StockPilot+Feature" alt="Feature graphic" width={300} height={200} className="rounded-lg mb-4 shadow-lg" data-ai-hint="inventory abstract" />
            <CardTitle className="text-xl mb-2 text-center">Streamline Your Inventory</CardTitle>
            <CardDescription className="text-center mb-4">
                StockPilot helps you manage your items efficiently. Explore features like receipt scanning and detailed analytics.
            </CardDescription>
            <Link href="/analytics" passHref>
                <Button variant="outline">View Full Analytics</Button>
            </Link>
        </Card>

      </div>
    </>
  );
}
