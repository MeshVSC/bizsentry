
"use client";

import type { CurrentUser } from "@/types/user";
import { createContext, useContext, type ReactNode } from "react";

interface AuthContextType {
  currentUser: CurrentUser | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children, currentUser }: { children: ReactNode; currentUser: CurrentUser | null }) {
  return (
    <AuthContext.Provider value={{ currentUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
