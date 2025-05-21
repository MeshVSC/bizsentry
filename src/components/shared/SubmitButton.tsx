
"use client";

import { useFormStatus } from "react-dom";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface SubmitButtonProps extends ButtonProps {
  children: React.ReactNode;
  isPending?: boolean; // Optional override for pending state
}

export function SubmitButton({ children, isPending: externalPending, ...props }: SubmitButtonProps) {
  const { pending: formPending } = useFormStatus();
  const showPending = externalPending !== undefined ? externalPending : formPending;

  return (
    <Button type="submit" disabled={showPending} {...props}>
      {showPending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Please wait
        </>
      ) : (
        children
      )}
    </Button>
  );
}
