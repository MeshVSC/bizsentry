
"use client";

import type { CurrentUser } from "@/types/user";
import { createContext, useContext, type ReactNode, useEffect } from "react";

interface AuthContextType {
  currentUser: CurrentUser | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children, currentUser }: { children: ReactNode; currentUser: CurrentUser | null }) {
  useEffect(() => {
    console.log(`[AuthProvider] Effect: currentUser updated or component mounted. currentUser:`, JSON.parse(JSON.stringify(currentUser || null)));
  }, [currentUser]);

  console.log(`[AuthProvider] Rendering. Initial currentUser prop:`, JSON.parse(JSON.stringify(currentUser || null)));

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
  // console.log('[useAuth] Context value:', context);
  return context;
}
