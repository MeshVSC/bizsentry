
"use client";

import { useState, useTransition } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import FileUploadInput from '@/components/shared/FileUploadInput';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { bulkImportItems, type BulkImportResult } from '@/lib/actions/itemActions';
import { Loader2, UploadCloud, CheckCircle, XCircle, DownloadCloud } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const CSV_EXPECTED_COLUMNS_ARRAY = [
    "name (required)", "quantity (required, number)", "purchasePrice (number, optional)", 
    "salesPrice (number, optional)", "msrp (number, optional)", "sku (optional)", 
    "category (optional)", "subcategory (optional)", "description (optional)", "vendor (optional)", 
    "storageLocation (optional)", "binLocation (optional)", "room (optional)", "project (optional)", 
    "purchaseDate (YYYY-MM-DD, optional)", "productImageUrl (URL, optional)", 
    "receiptImageUrl (URL, optional)", "productUrl (URL, optional)", "status (in stock/in use/sold, optional, defaults to 'in stock')"
];
const CSV_EXPECTED_COLUMNS_STRING = CSV_EXPECTED_COLUMNS_ARRAY.join(',');

export default function BulkImportPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, startTransition] = useTransition();
  const [importResult, setImportResult] = useState<BulkImportResult | null>(null);
  const { toast } = useToast();

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setImportResult(null); 
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast({ title: "No File Selected", description: "Please select a CSV file to import.", variant: "destructive" });
      return;
    }

    setImportResult(null);
    startTransition(async () => {
      try {
        const fileContent = await selectedFile.text();
        const result = await bulkImportItems(fileContent);
        setImportResult(result);
        if (result.successCount > 0) {
            toast({ title: "Import Complete", description: `${result.successCount} item(s) imported successfully. ${result.errorCount > 0 ? `${result.errorCount} item(s) failed.` : ''}` });
        } else if (result.errorCount > 0) {
            toast({ title: "Import Failed", description: `All ${result.errorCount} item(s) failed to import. See details below.`, variant: "destructive"});
        } else {
             toast({ title: "Import Complete", description: "No items were found to import in the file.", variant: "default"});
        }
      } catch (error) {
        console.error("Bulk import error:", error);
        toast({ title: "Import Error", description: "An unexpected error occurred during import.", variant: "destructive" });
        setImportResult({ successCount: 0, errorCount: 1, errors: [{rowNumber: 0, message: "Failed to read or process file.", rowData: ""}]}); 
      }
    });
  };

  const handleDownloadTemplate = () => {
    const csvHeader = [
        "name", "quantity", "purchasePrice", "salesPrice", "msrp", "sku", 
        "category", "subcategory", "description", "vendor", "storageLocation", "binLocation", "room", "project",
        "purchaseDate", "productImageUrl", "receiptImageUrl", "productUrl", "status"
    ].join(',') + '\\n';
    const blob = new Blob([csvHeader], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) { 
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "bizsentry_import_template.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
  };

  return (
    <>
      <PageHeader title="Bulk Import Items" description="Upload a CSV file to add multiple items to your inventory." />
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upload CSV File</CardTitle>
          <CardDescription>
            Ensure your CSV file has the following columns: <br />
            <code className="text-xs bg-muted p-1 rounded break-all block my-2">{CSV_EXPECTED_COLUMNS_STRING}</code>
            The first row should be headers matching these names (case-insensitive). `name` and `quantity` are required. Other fields are optional.
            Dates should be in YYYY-MM-DD format. URLs should be valid. Status can be &apos;in stock&apos;, &apos;in use&apos;, or &apos;sold&apos;.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FileUploadInput
              onFileSelect={handleFileSelect}
              acceptedFileTypes=".csv, text/csv"
              buttonText={selectedFile ? `File: ${selectedFile.name}` : "Select CSV File"}
              buttonIcon={<UploadCloud className="mr-2 h-4 w-4" />}
              maxFileSizeMB={5} 
              disabled={isProcessing}
            />
            <Button onClick={handleDownloadTemplate} variant="outline" disabled={isProcessing}>
              <DownloadCloud className="mr-2 h-4 w-4" /> Download CSV Template
            </Button>
          </div>
          <Button onClick={handleImport} disabled={!selectedFile || isProcessing} className="w-full sm:w-auto">
            {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
            Import Items
          </Button>
        </CardContent>
      </Card>

      {importResult && (
        <Card>
          <CardHeader>
            <CardTitle>Import Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <p>{importResult.successCount} item(s) imported successfully.</p>
                </div>
                {importResult.errorCount > 0 && (
                    <div className="flex items-center gap-2">
                        <XCircle className="h-5 w-5 text-destructive" />
                        <p>{importResult.errorCount} item(s) failed to import.</p>
                    </div>
                )}

                {importResult.errors && importResult.errors.length > 0 && (
                <div>
                    <h3 className="font-semibold mt-4 mb-2">Error Details:</h3>
                    <ScrollArea className="h-60 w-full rounded-md border p-4 bg-muted/30">
                    <ul className="space-y-2 text-xs">
                        {importResult.errors.map((err, index) => (
                        <li key={index} className="p-2 border-b last:border-b-0">
                            <p><strong>Row {err.rowNumber}:</strong> {err.message}</p>
                            {err.rowData && <p className="text-muted-foreground truncate">Data: <code className="text-xs">{err.rowData}</code></p>}
                        </li>
                        ))}
                    </ul>
                    </ScrollArea>
                </div>
                )}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
