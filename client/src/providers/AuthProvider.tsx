import {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
} from "react";
import type { User } from "@/data/user";
import { api, type APIResponse } from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "@tanstack/react-router";

export type AuthContextType = {
  user: User | null;
  logout: () => void;
  login: (email: string, password: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {
    throw new Error("Not initialized");
  },
  logout: () => {
    throw new Error("Not initialized");
  },
});

export async function getUser(token?: string): Promise<User | null> {
  try {
    const response: APIResponse<User> = await api("/auth/user", {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return response.data;
  } catch (error) {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
    router.navigate({
      to: "/",
    });
    toast.success("Logged out successfully");
  }

  async function login(email: string, password: string) {
    try {
      const response = await api<APIResponse<string>>("/auth/login", {
        body: { email, password },
        method: "POST",
      });

      if (!response.data) {
        throw new Error(response.error!);
      }

      const user = await getUser(response.data);
      if (!user) {
        throw new Error("Failed to fetch user");
      }

      localStorage.setItem("token", response.data);
      setUser(user);
      toast.success("Logged in successfully");
      window.location.reload();
    } catch (error) {
      console.log(error);
      setUser(null);
      toast.error(error instanceof Error ? error.message : "Failed to log in");
    }
  }

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setUser(null);
        return;
      }

      const user = await getUser();
      setUser(user);
    };
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  return useContext(AuthContext);
}
