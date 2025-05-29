
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { SubmitButton } from "@/components/shared/SubmitButton";
import Image from "next/image";
import { supabase } from "@/lib/supabase/client"; // Import Supabase client

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (signInError) {
        setError(signInError.message);
        toast({ title: "Login Failed", description: signInError.message, variant: "destructive" });
      } else {
        toast({ title: "Login Successful", description: "Redirecting to dashboard..." });
        router.push("/dashboard"); // Redirect to dashboard on successful login
        router.refresh(); // Refresh to ensure layout picks up new auth state
      }
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
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                disabled={isPending}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
