
import { getItemById, deleteItem } from '@/lib/actions/itemActions';
import { notFound, redirect } from 'next/navigation';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Edit, Trash2, DollarSign, Package, Layers, MapPin, Tag, Briefcase, CalendarDays, FileText, Image as ImageIconProp, Link as LinkIcon, Archive, PackageOpen, Construction, Building, Fingerprint, QrCode as QrCodeIcon, Barcode as BarcodeIcon } from 'lucide-react'; 
import Link from 'next/link';
import Image from 'next/image';
import type { ReactNode, ElementType } from 'react';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { SubmitButton } from '@/components/shared/SubmitButton';
import { cn } from "@/lib/utils";
import QRCodeDisplay from '@/components/shared/QRCodeDisplay';
import BarcodeDisplay from '@/components/shared/BarcodeDisplay';

async function DeleteItemAction({ itemId }: { itemId: string }) {
  const deleteItemWithId = async () => {
    "use server";
    await deleteItem(itemId);
    redirect('/inventory');
  }
  return (
    <form action={deleteItemWithId}>
      <SubmitButton variant="destructive">Delete</SubmitButton>
    </form>
  );
}

interface DetailItemProps {
  icon: ElementType;
  label: string;
  value?: string | number | null;
  isCurrency?: boolean;
  isDate?: boolean;
  isUrl?: boolean;
  className?: string;
}

function DetailItem({ icon: Icon, label, value, isCurrency = false, isDate = false, isUrl = false, className }: DetailItemProps) {
  if (value === null || typeof value === 'undefined' || value === '') return null;

  let displayValue: ReactNode = String(value);
  if (isCurrency && typeof value === 'number') {
    displayValue = `$${value.toFixed(2)}`; 
  } else if (isDate && typeof value === 'string') {
    try {
      displayValue = new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) {
      displayValue = "Invalid Date"; 
    }
  } else if (isUrl && typeof value === 'string' && value.startsWith('http')) {
    displayValue = (
      <Link href={value} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">
        {value}
      </Link>
    );
  }

  return (
    <div className="flex items-start space-x-3">
      <Icon className={cn("h-5 w-5 text-muted-foreground mt-1 flex-shrink-0", className)} />
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-sm text-muted-foreground">{displayValue}</p>
      </div>
    </div>
  );
}


export default async function ItemDetailPage({ params }: { params: { id: string } }) {
  const item = await getItemById(params.id);

  if (!item) {
    notFound();
  }

  let profitLoss: number | null = null;
  let profitLossIcon = DollarSign;
  let profitLossColor = "text-muted-foreground";

  if (typeof item.salesPrice === 'number' && typeof item.originalPrice === 'number') {
    profitLoss = item.salesPrice - item.originalPrice;
    if (profitLoss > 0) {
      profitLossIcon = TrendingUp;
      profitLossColor = "text-green-500"; 
    } else if (profitLoss < 0) {
      profitLossIcon = TrendingDown;
      profitLossColor = "text-red-500"; 
    }
  }

  const statusColors: Record<string, string> = {
    'in stock': 'bg-green-700/20 text-green-400 border-green-700/50',
    'in use': 'bg-blue-700/20 text-blue-400 border-blue-700/50',
    'sold': 'bg-red-700/20 text-red-400 border-red-700/50',
  };
  const statusText: Record<string, string> = {
    'in stock': 'In Stock',
    'in use': 'In Use',
    'sold': 'Sold',
  };


  return (
    <>
      <PageHeader
        title={item.name}
        description={item.description || "No description available."}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href={`/inventory/${item.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </Link>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the item "{item.name}".
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <DeleteItemAction itemId={item.id} />
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        }
      />

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {item.productImageUrl && (
            <Card>
              <CardHeader><CardTitle>Product Image</CardTitle></CardHeader>
              <CardContent>
                <div className="relative aspect-video w-full max-w-md mx-auto">
                  <Image src={item.productImageUrl} alt={`Product image for ${item.name}`} fill className="rounded-md border object-contain" data-ai-hint="product commercial" />
                </div>
              </CardContent>
            </Card>
          )}
          <Card>
            <CardHeader><CardTitle>Item Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                <DetailItem icon={Fingerprint} label="SKU" value={item.sku} />
                <DetailItem icon={Package} label="Quantity" value={item.quantity} />
                <DetailItem icon={Layers} label="Category" value={item.category} />
                <DetailItem icon={Archive} label="Subcategory" value={item.subcategory} />
                <DetailItem icon={DollarSign} label="Purchase Price" value={item.originalPrice} isCurrency />
                <DetailItem icon={DollarSign} label="Sales Price" value={item.salesPrice} isCurrency />
                <DetailItem icon={DollarSign} label="MSRP" value={item.msrp} isCurrency /> {/* Changed icon for MSRP */}
                {profitLoss !== null && (
                  <DetailItem icon={profitLossIcon} label="Est. Profit/Loss" value={profitLoss} isCurrency className={profitLossColor} />
                )}
                <DetailItem icon={PackageOpen} label="Storage Location" value={item.storageLocation} />
                <DetailItem icon={Tag} label="Bin Location" value={item.binLocation} />
                <DetailItem icon={Building} label="Room" value={item.room} />
                <DetailItem icon={Briefcase} label="Vendor" value={item.vendor} />
                <DetailItem icon={Construction} label="Project" value={item.project} />
                {item.productUrl && (<DetailItem icon={LinkIcon} label="Product URL" value={item.productUrl} isUrl />)}
                <DetailItem icon={CalendarDays} label="Purchase Date" value={item.purchaseDate} isDate />
                {item.status === 'in use' && item.inUseDate && (
                    <DetailItem icon={CalendarDays} label="In Use Since" value={item.inUseDate} isDate />
                )}
                {item.status === 'sold' && item.soldDate && (
                    <DetailItem icon={CalendarDays} label="Sold Date" value={item.soldDate} isDate />
                )}
                <DetailItem icon={CalendarDays} label="Created At" value={item.createdAt} isDate />
                <DetailItem icon={CalendarDays} label="Last Updated" value={item.updatedAt} isDate />
              </div>
               <div className="mt-4">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full capitalize border ${statusColors[item.status] || 'bg-card text-foreground border-border'}`}>
                  {statusText[item.status] || item.status}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Codes</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium flex items-center"><BarcodeIcon className="mr-2 h-4 w-4 text-muted-foreground" /> Barcode Data</h3>
                <p className="text-sm text-muted-foreground bg-muted p-2 rounded-md mt-1 break-all">{item.barcodeData || 'N/A'}</p>
                {item.barcodeData && <BarcodeDisplay value={item.barcodeData} className="mt-2 mx-auto" />}
              </div>
              <Separator />
              <div>
                <h3 className="text-sm font-medium flex items-center"><QrCodeIcon className="mr-2 h-4 w-4 text-muted-foreground" /> QR Code Data</h3>
                <p className="text-sm text-muted-foreground bg-muted p-2 rounded-md mt-1 break-all">{item.qrCodeData || 'N/A'}</p>
                 {item.qrCodeData && <QRCodeDisplay value={item.qrCodeData} size={150} className="mt-2" />}
              </div>
            </CardContent>
          </Card>

          {item.receiptImageUrl && (
            <Card>
              <CardHeader><CardTitle>Receipt</CardTitle></CardHeader>
              <CardContent>
                <Image src={item.receiptImageUrl} alt="Receipt" width={300} height={400} className="rounded-md border w-full object-contain max-h-96" data-ai-hint="receipt shopping" />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
