
"use client";

import { useState, useTransition } from "react";
// No longer need useRouter here for successful navigation
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { SubmitButton } from "@/components/shared/SubmitButton";
import Image from "next/image";
import { loginUser } from "@/lib/actions/userActions";

export default function LoginPage() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  // const router = useRouter(); // Not needed for push/refresh anymore

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      // loginUser will now redirect on success or return an error object
      const result = await loginUser(formData);

      if (result && !result.success) { // If result is returned, it's an error
        setError(result.message || "Login failed.");
        toast({ title: "Login Failed", description: result.message || "Invalid credentials.", variant: "destructive" });
      }
      // No else needed: successful loginUser will have already redirected.
      // If it doesn't redirect and doesn't return an error, something is very wrong,
      // but the primary paths are redirect or error object.
    });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 relative">
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="mb-4 mt-4 mx-auto">
            <div className="inline-block text-center">
               <Image
                src="/logo.png"
                alt="StockSentry Logo"
                width={1024}
                height={1024}
                className="h-16 sm:h-24 w-auto mx-auto"
                priority
                data-ai-hint="logo company"
              />
            </div>
          </div>
          <CardDescription className="text-muted-foreground pt-2">
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
                placeholder="Enter your username"
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
                placeholder="••••••••"
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
      </Card>
      <div className="absolute bottom-4 right-4 text-xs text-muted-foreground">
        MeshCode 2025
      </div>
    </div>
  );
}

