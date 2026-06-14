"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { ThemeProvider } from "next-themes";
import { SessionProvider, useSession, signOut as nextAuthSignOut } from "next-auth/react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "CITIZEN" | "BANK" | "REGISTRAR" | "ADMIN" | "BUILDER" | "AGRI";
  walletAddress?: string;
  aadhaarHash?: string;
  kycStatus?: "PENDING_MANUAL_REVIEW" | "VERIFIED" | "REJECTED";
}

interface AuthContextType {
  user: User | null;
  login: (aadhaarOrHash: string, role?: string, customName?: string, customKycStatus?: string) => Promise<boolean>;
  logout: () => void;
  connectWallet: () => Promise<string | null>;
  walletAddress: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => false,
  logout: () => {},
  connectWallet: async () => null,
  walletAddress: null,
});

export const useAuth = () => useContext(AuthContext);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <ProvidersContent>{children}</ProvidersContent>
      </ThemeProvider>
    </SessionProvider>
  );
}

function ProvidersContent({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  // Load wallet from localStorage on mount
  useEffect(() => {
    const savedWallet = localStorage.getItem("landchain_wallet");
    if (savedWallet) {
      setWalletAddress(savedWallet);
    }
  }, []);

  // Sync user state from NextAuth session
  useEffect(() => {
    if (session?.user) {
      setUser({
        id: session.user.id as string,
        name: session.user.name as string,
        email: session.user.email as string,
        role: (session.user.role || "CITIZEN") as any,
        walletAddress: walletAddress || undefined,
        aadhaarHash: (session.user as any).aadhaarHash || undefined,
        kycStatus: "VERIFIED", // default verified for Email/Google flow
      });
    } else if (status === "unauthenticated") {
      setUser(null);
    }
  }, [session, status, walletAddress]);

  const login = async (aadhaarOrHash: string, selectedRole: string = "CITIZEN", customName?: string, customKycStatus?: string) => {
    // This is a legacy placeholder login function since login is now managed via NextAuth signIn
    return true;
  };

  const logout = () => {
    nextAuthSignOut();
    setUser(null);
  };

  const connectWallet = async () => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({
          method: "eth_requestAccounts",
        });
        const address = accounts[0];
        setWalletAddress(address);
        localStorage.setItem("landchain_wallet", address);
        
        if (user) {
          setUser({ ...user, walletAddress: address });
        }
        return address;
      } catch (err) {
        console.error("Wallet connection failed:", err);
        return null;
      }
    } else {
      const mockAddress = "0x" + Math.random().toString(16).substring(2, 42);
      setWalletAddress(mockAddress);
      localStorage.setItem("landchain_wallet", mockAddress);
      
      if (user) {
        setUser({ ...user, walletAddress: mockAddress });
      }
      return mockAddress;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, connectWallet, walletAddress }}>
      {children}
    </AuthContext.Provider>
  );
}
