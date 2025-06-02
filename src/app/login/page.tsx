
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
// import { Button } from "@/components/ui/button"; // Not needed for redirect-only page
// import { Input } from "@/components/ui/input"; // Not needed
// import { Label } from "@/components/ui/label"; // Not needed
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"; // Not needed
// import { useToast } from "@/hooks/use-toast"; // Not needed
// import { SubmitButton } from "@/components/shared/SubmitButton"; // Not needed
// import Image from "next/image"; // Not needed
// import { loginUser } from "@/lib/actions/userActions"; // Not needed

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Auth is effectively disabled, redirect to dashboard if this page is somehow accessed.
    router.replace('/dashboard'); // Use replace to not add /login to browser history
  }, [router]);

  // Optionally, render a loading message or null while redirecting
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 relative">
      <p className="text-foreground">Redirecting to dashboard...</p>
      <div className="absolute bottom-4 right-4 text-xs text-muted-foreground">
        MeshCode 2025
      </div>
    </div>
  );
}
