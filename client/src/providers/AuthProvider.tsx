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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
    toast.success("Logged out successfully");
  }

  async function login(email: string, password: string) {
    try {
      const response = await api<APIResponse<string>>("/auth/login", {
        body: { email, password },
        method: "POST",
      });

      if (!response.data) {
        toast.error(response.error);
        return;
      }

      localStorage.setItem("token", response.data);

      const userResponse: APIResponse<User> = await api("/auth/user");
      if (!userResponse.data) {
        toast.error(userResponse.error);
        return;
      }

      setUser(userResponse.data);
      toast.success("Logged in successfully");
      router.navigate({
        to: "/",
      });
    } catch (error) {
      console.log(error);
      toast.error("An error occurred while logging in");
    }
  }

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setUser(null);
        return;
      }

      try {
        const response: APIResponse<User> = await api("/auth/user");
        if (response.data) {
          setUser(response.data);
        } else {
          setUser(null);
        }
      } catch (error) {
        setUser(null);
      }
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
