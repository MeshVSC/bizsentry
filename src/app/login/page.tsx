
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { loginUser } from "@/lib/actions/userActions";
import { useToast } from "@/hooks/use-toast";
import { SubmitButton } from "@/components/shared/SubmitButton";
import Image from "next/image";
import { ShieldAlert } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await loginUser(formData);
      if (result.success && result.user) {
        toast({ title: "Login Successful", description: `Welcome back, ${result.user.username}!` });
        router.push("/dashboard"); // Redirect to dashboard
        router.refresh(); // Force refresh to update layout with user state
      } else {
        setError(result.message || "Login failed. Please try again.");
        toast({ title: "Login Failed", description: result.message || "Invalid credentials.", variant: "destructive" });
      }
    });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <ShieldAlert className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold text-foreground">StockSentry Login</CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter your credentials to access your inventory.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="admin"
                required
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="adminpassword"
                required
                disabled={isPending}
              />
            </div>
            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}
          </CardContent>
          <CardFooter>
            <SubmitButton className="w-full" isPending={isPending}>
              Login
            </SubmitButton>
          </CardFooter>
        </form>
         <div className="p-4 text-center text-xs text-muted-foreground border-t mt-2">
            <p className="font-bold text-destructive">PROTOTYPE ONLY - NOT SECURE</p>
            <p>Sample users: (admin/adminpassword), (viewer/viewerpassword)</p>
        </div>
      </Card>
    </div>
  );
}
