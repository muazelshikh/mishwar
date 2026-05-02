import { createContext, useContext, useEffect, useState } from "react";
import { useGetMe } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
  user: any;
  setTokenAndRedirect: (token: string, path?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem("mishwar_token"));
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: user, isLoading, isError } = useGetMe({
    query: {
      enabled: !!token,
      retry: false,
    } as any,
  });

  useEffect(() => {
    if (isError) {
      localStorage.removeItem("mishwar_token");
      setToken(null);
      setLocation("/auth");
    }
  }, [isError, setLocation]);

  const setTokenAndRedirect = (newToken: string, path = "/") => {
    localStorage.setItem("mishwar_token", newToken);
    setToken(newToken);
    queryClient.invalidateQueries();
    setLocation(path);
  };

  const logout = () => {
    localStorage.removeItem("mishwar_token");
    setToken(null);
    queryClient.clear();
    setLocation("/auth");
  };

  const effectivelyLoading = isLoading || (!!token && !user && !isError);

  return (
    <AuthContext.Provider value={{
      isAuthenticated: !!user,
      isLoading: effectivelyLoading,
      logout,
      user,
      setTokenAndRedirect,
    }}>
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
