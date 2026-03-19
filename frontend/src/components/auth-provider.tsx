"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";

interface AuthContextType {
  isAuthenticated: boolean;
  role: string | null;
  nombre: string | null;
  login: (token: string, userRole: string, userName: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [role, setRole] = useState<string | null>(null);
  const [nombre, setNombre] = useState<string | null>(null);

  useEffect(() => {
    const token = Cookies.get("access_token");
    const storedRole = Cookies.get("user_role");
    const storedNombre = Cookies.get("user_nombre");
    if (token) {
      setIsAuthenticated(true);
      setRole(storedRole || null);
      setNombre(storedNombre || null);
    }
  }, []);

  const login = (token: string, userRole: string, userName: string) => {
    Cookies.set("access_token", token, { expires: 7 });
    Cookies.set("user_role", userRole, { expires: 7 });
    Cookies.set("user_nombre", userName, { expires: 7 });
    setIsAuthenticated(true);
    setRole(userRole);
    setNombre(userName);
  };

  const logout = () => {
    Cookies.remove("access_token");
    Cookies.remove("user_role");
    Cookies.remove("user_nombre");
    setIsAuthenticated(false);
    setRole(null);
    setNombre(null);
    window.location.href = "/admin/login";
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, role, nombre, login, logout }}>
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
