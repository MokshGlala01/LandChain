"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { ThemeProvider } from "next-themes";

// Define a simple custom AuthContext for the Aadhaar mock login flow to keep things robust,
// while also allowing seamless NextAuth bindings.
interface User {
  id: string;
  name: string;
  phone: string;
  role: "CITIZEN" | "BANK" | "REGISTRAR" | "ADMIN";
  walletAddress?: string;
  aadhaarHash: string;
}

interface AuthContextType {
  user: User | null;
  login: (aadhaar: string, role?: string) => Promise<boolean>;
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
  const [user, setUser] = useState<User | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("landchain_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    const savedWallet = localStorage.getItem("landchain_wallet");
    if (savedWallet) {
      setWalletAddress(savedWallet);
    }
  }, []);

  const login = async (aadhaar: string, selectedRole: string = "CITIZEN") => {
    const cleanAadhaar = aadhaar.replace(/\s/g, "");
    const mockHash = "aadhaar_" + cleanAadhaar;
    
    // Default mock profiles in case API fails
    let id = "usr_" + Math.random().toString(36).substring(2, 9);
    let name = "Rohan Sharma";
    let phone = "+91 98765 43210";
    let role = selectedRole;

    try {
      const res = await fetch(`/api/user/lookup?aadhaar=${encodeURIComponent(cleanAadhaar)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.id) {
          id = data.id;
        }
        name = data.name;
        phone = data.phone;
        role = data.role;
      }
    } catch (err) {
      console.warn("User lookup failed during login provider setup, using default mock details.");
    }

    const mockUser: User = {
      id,
      aadhaarHash: mockHash,
      name,
      phone,
      role: role as any,
      walletAddress: walletAddress || undefined,
    };

    setUser(mockUser);
    localStorage.setItem("landchain_user", JSON.stringify(mockUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("landchain_user");
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
        
        // Update current user if exists
        if (user) {
          const updated = { ...user, walletAddress: address };
          setUser(updated);
          localStorage.setItem("landchain_user", JSON.stringify(updated));
        }
        return address;
      } catch (err) {
        console.error("Wallet connection failed:", err);
        return null;
      }
    } else {
      // Mock wallet generation if MetaMask is not present
      const mockAddress = "0x" + Math.random().toString(16).substring(2, 42);
      setWalletAddress(mockAddress);
      localStorage.setItem("landchain_wallet", mockAddress);
      
      if (user) {
        const updated = { ...user, walletAddress: mockAddress };
        setUser(updated);
        localStorage.setItem("landchain_user", JSON.stringify(updated));
      }
      return mockAddress;
    }
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AuthContext.Provider value={{ user, login, logout, connectWallet, walletAddress }}>
        {children}
      </AuthContext.Provider>
    </ThemeProvider>
  );
}
