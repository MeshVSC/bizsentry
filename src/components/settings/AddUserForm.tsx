
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { addUser } from "@/lib/actions/userActions";
import type { UserFormInput, UserRole } from "@/types/user";
import { SubmitButton } from "@/components/shared/SubmitButton";
import { PlusCircle } from "lucide-react";
import { useTransition } from "react";

const userRoles: UserRole[] = ["admin", "manager", "viewer"];

// Password is no longer required in this form, as Supabase handles actual auth.
// This form is for mapping a Supabase user's email to an app-specific role.
const addUserRoleSchema = z.object({
  username: z.string().min(3, "Email must be at least 3 characters.").max(50).email("Invalid email address."), // Changed to validate as email
  role: z.enum(userRoles, { required_error: "Role is required." }),
});

type AddUserRoleFormValues = z.infer<typeof addUserRoleSchema>;

export default function AddUserForm() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const form = useForm<AddUserRoleFormValues>({
    resolver: zodResolver(addUserRoleSchema),
    defaultValues: {
      username: "",
      role: "viewer",
    },
  });

  const onSubmit = async (data: AddUserRoleFormValues) => {
    startTransition(async () => {
      // Pass data as UserFormInput, password will be undefined
      const result = await addUser(data as UserFormInput); 
      if (result.success) {
        toast({ title: "Success", description: result.message });
        form.reset();
      } else {
        toast({ title: "Error", description: result.message || "Failed to add user role assignment.", variant: "destructive" });
      }
    });
  };

  return (
    <div>
      <h3 className="text-lg font-medium mb-2">Add User Role Assignment</h3>
      <p className="text-sm text-muted-foreground mb-3">
        Enter the email of a user (who logs in via Supabase) to assign them a role in this application.
      </p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>User's Email</FormLabel>
                <FormControl><Input placeholder="e.g., user@example.com" {...field} /></FormControl>
                <FormDescription className="text-xs">
                  This email must match their Supabase login email.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {userRoles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <SubmitButton isPending={isPending}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Role Assignment
          </SubmitButton>
        </form>
      </Form>
    </div>
  );
}
