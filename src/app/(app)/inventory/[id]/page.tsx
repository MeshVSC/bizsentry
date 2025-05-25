
import { getItemById } from '@/lib/actions/itemActions';
import { notFound, redirect } from 'next/navigation';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Barcode, QrCode, Edit, Trash2, DollarSign, Package, Layers, MapPin, Tag, Briefcase, CalendarDays, FileText, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { deleteItem } from '@/lib/actions/itemActions';
import { SubmitButton } from '@/components/shared/SubmitButton';

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
  icon: React.ElementType;
  label: string;
  value?: string | number | null;
  isCurrency?: boolean;
  isDate?: boolean;
}

function DetailItem({ icon: Icon, label, value, isCurrency = false, isDate = false }: DetailItemProps) {
  if (value === null || typeof value === 'undefined' || value === '') return null;
  
  let displayValue = value;
  if (isCurrency && typeof value === 'number') {
    displayValue = `$${value.toFixed(2)}`;
  } else if (isDate && typeof value === 'string') {
    displayValue = new Date(value).toLocaleDateString();
  }

  return (
    <div className="flex items-start space-x-3">
      <Icon className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-sm text-muted-foreground">{String(displayValue)}</p>
      </div>
    </div>
  );
}


export default async function ItemDetailPage({ params }: { params: { id: string } }) {
  const item = await getItemById(params.id);

  if (!item) {
    notFound();
  }

  return (
    <>
      <PageHeader
        title={item.name}
        description={item.description || "No description available."}
        actions={
          <div className="flex gap-2">
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
              <CardHeader>
                <CardTitle>Product Image</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative aspect-video w-full max-w-md mx-auto">
                  <Image 
                    src={item.productImageUrl} 
                    alt={`Product image for ${item.name}`} 
                    fill
                    className="rounded-md border object-contain"
                    data-ai-hint="product commercial"
                   />
                </div>
              </CardContent>
            </Card>
          )}
          <Card>
            <CardHeader>
              <CardTitle>Item Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                <DetailItem icon={Package} label="Quantity" value={item.quantity} />
                <DetailItem icon={Layers} label="Category" value={item.category} />
                <DetailItem icon={DollarSign} label="Original Price" value={item.originalPrice} isCurrency />
                <DetailItem icon={DollarSign} label="Sales Price" value={item.salesPrice} isCurrency />
                <DetailItem icon={MapPin} label="Storage Location" value={item.storageLocation} />
                <DetailItem icon={Tag} label="Bin Location" value={item.binLocation} />
                <DetailItem icon={Briefcase} label="Vendor" value={item.vendor} />
                <DetailItem icon={Briefcase} label="Project" value={item.project} />
                <DetailItem icon={CalendarDays} label="Created At" value={item.createdAt} isDate />
                <DetailItem icon={CalendarDays} label="Last Updated" value={item.updatedAt} isDate />
              </div>
               <div className="mt-4">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${item.sold ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                  {item.sold ? 'Sold Out' : 'In Stock'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Codes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium flex items-center"><Barcode className="mr-2 h-4 w-4 text-muted-foreground" /> Barcode Data</h3>
                <p className="text-sm text-muted-foreground bg-muted p-2 rounded-md mt-1 break-all">{item.barcodeData || 'N/A'}</p>
                <Image src={`https://placehold.co/300x100.png?text=${item.barcodeData || 'BARCODE'}`} alt="Barcode placeholder" width={300} height={100} className="mt-2 rounded border" data-ai-hint="barcode serial" />
              </div>
              <Separator />
              <div>
                <h3 className="text-sm font-medium flex items-center"><QrCode className="mr-2 h-4 w-4 text-muted-foreground" /> QR Code Data</h3>
                <p className="text-sm text-muted-foreground bg-muted p-2 rounded-md mt-1 break-all">{item.qrCodeData || 'N/A'}</p>
                <Image src={`https://placehold.co/150x150.png?text=${item.qrCodeData || 'QRCODE'}`} alt="QR Code placeholder" width={150} height={150} className="mt-2 rounded border" data-ai-hint="qrcode link" />
              </div>
            </CardContent>
          </Card>

          {item.receiptImageUrl && (
            <Card>
              <CardHeader>
                <CardTitle>Receipt</CardTitle>
              </CardHeader>
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
