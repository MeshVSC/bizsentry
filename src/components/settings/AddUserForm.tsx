
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; // Not explicitly used, but FormLabel is
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { addUser } from "@/lib/actions/userActions"; // Custom addUser
import type { UserFormInput, UserRole } from "@/types/user";
import { SubmitButton } from "@/components/shared/SubmitButton";
import { PlusCircle } from "lucide-react";
import { useTransition } from "react";

const userRoles: UserRole[] = ["admin", "manager", "viewer"];

// Schema now includes password, matching custom table requirements
const addUserSchema = z.object({
  username: z.string().min(3, "Email must be at least 3 characters.").max(50).email("Invalid email address."),
  password: z.string().min(5, "Password must be at least 5 characters.")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
    .regex(/[0-9]/, "Password must contain at least one number."),
  role: z.enum(userRoles, { required_error: "Role is required." }),
});

type AddUserFormValues = z.infer<typeof addUserSchema>;

export default function AddUserForm() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const form = useForm<AddUserFormValues>({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      username: "",
      password: "",
      role: "viewer",
    },
  });

  const onSubmit = async (data: AddUserFormValues) => {
    startTransition(async () => {
      const result = await addUser(data); 
      if (result.success) {
        toast({ title: "Success", description: result.message });
        form.reset(); // Clear form on success
      } else {
        toast({ title: "Error", description: result.message || "Failed to add user.", variant: "destructive" });
      }
    });
  };

  return (
    <div>
      <h3 className="text-lg font-medium mb-2">Add New User</h3>
      <p className="text-sm text-muted-foreground mb-3">
        Create a new user account and assign them a role.
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
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                 <FormDescription className="text-xs">
                  Min. 5 chars, 1 uppercase, 1 number.
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
            <PlusCircle className="mr-2 h-4 w-4" /> Add User
          </SubmitButton>
        </form>
      </Form>
    </div>
  );
}
