"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { api, getToken, setToken, removeToken, type User } from "./api-client";

type AuthState =
  | { status: "loading" }
  | { status: "authenticated"; user: User }
  | { status: "unauthenticated" };

type AuthContextValue = {
  state: AuthState;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: "loading" });
  const router = useRouter();

  // Load user from stored token on mount
  const loadUser = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setState({ status: "unauthenticated" });
      return;
    }
    try {
      const res = await api.auth.me();
      setState({ status: "authenticated", user: res.user });
    } catch {
      removeToken();
      setState({ status: "unauthenticated" });
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email: string, password: string) => {
    const res = await api.auth.login({ email, password });
    setToken(res.token);
    setState({ status: "authenticated", user: res.user });
    router.push("/dashboard");
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await api.auth.register({ name, email, password });
    setToken(res.token);
    setState({ status: "authenticated", user: res.user });
    router.push("/dashboard");
  };

  const logout = () => {
    removeToken();
    setState({ status: "unauthenticated" });
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        state,
        user: state.status === "authenticated" ? state.user : null,
        login,
        register,
        logout,
        isLoading: state.status === "loading",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an <AuthProvider>");
  return ctx;
}

// Hook to protect routes
export function useRequireAuth() {
  const { state, user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (state.status === "unauthenticated") {
      router.replace("/login");
    }
  }, [state, router]);

  return { state, user, isLoading };
}
