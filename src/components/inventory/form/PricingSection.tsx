"use client";

import { Control } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { DatePicker } from "@/components/shared/DatePicker";

interface PricingSectionProps {
  control: Control;
  availableVendors: string[];
  watchStatus: string;
}

export default function PricingSection({
  control,
  availableVendors,
  watchStatus,
}: PricingSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pricing & Purchase Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={control}
            name="originalPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purchase Price (Cost)</FormLabel>
                <FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="salesPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sales Price</FormLabel>
                <FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="msrp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>MSRP</FormLabel>
                <FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="purchaseDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Purchase Date</FormLabel>
                <DatePicker value={field.value} onChange={field.onChange} placeholder="Select purchase date" />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="vendor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vendor</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select a vendor" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {availableVendors.map(option => (<SelectItem key={option} value={option}>{option}</SelectItem>))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {watchStatus === 'sold' && (
          <FormField
            control={control}
            name="soldDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Sold Date</FormLabel>
                <DatePicker value={field.value} onChange={field.onChange} placeholder="Select sold date"/>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        {watchStatus === 'in use' && (
          <FormField
            control={control}
            name="inUseDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>In Use Date</FormLabel>
                <DatePicker value={field.value} onChange={field.onChange} placeholder="Select in use date"/>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </CardContent>
    </Card>
  );
}