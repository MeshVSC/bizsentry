
"use client";

import { useTransition, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { SubmitButton } from '@/components/shared/SubmitButton';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import type { AppSettings } from '@/lib/actions/settingsActions';
import { updateDefaultItemsPerPage } from '@/lib/actions/settingsActions';

const appSettingsSchema = z.object({
  defaultItemsPerPage: z.coerce.number().min(1, "Must be at least 1").max(100, "Cannot exceed 100"),
});

type AppSettingsFormValues = z.infer<typeof appSettingsSchema>;

interface ApplicationSettingsFormProps {
  currentSettings: AppSettings;
}

export default function ApplicationSettingsForm({ currentSettings }: ApplicationSettingsFormProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<AppSettingsFormValues>({
    resolver: zodResolver(appSettingsSchema),
    defaultValues: {
      defaultItemsPerPage: currentSettings.defaultItemsPerPage,
    },
  });

 useEffect(() => {
    form.reset({ defaultItemsPerPage: currentSettings.defaultItemsPerPage });
  }, [currentSettings, form]);

  const onSubmit = async (data: AppSettingsFormValues) => {
    startTransition(async () => {
      const result = await updateDefaultItemsPerPage(data.defaultItemsPerPage);
      if (result.success) {
        toast({ title: "Success", description: result.message });
        if (result.settings) {
          form.reset({ defaultItemsPerPage: result.settings.defaultItemsPerPage });
        }
      } else {
        toast({ title: "Error", description: result.message || "Failed to update settings.", variant: "destructive" });
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-md">
        <FormField
          control={form.control}
          name="defaultItemsPerPage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Default Items Per Page (Inventory)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g., 10" {...field} />
              </FormControl>
              <FormDescription>
                Set the default number of items displayed per page on the inventory list.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <SubmitButton isPending={isPending}>Save Settings</SubmitButton>
      </form>
    </Form>
  );
}
