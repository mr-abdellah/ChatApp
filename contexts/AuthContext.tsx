import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import Toast from "react-native-toast-message";
import { apiService } from "../services/api";
import { StorageService } from "../services/storage";
import { AuthContextType, LoginData, RegisterData, User } from "../types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const [storedToken, storedUser] = await Promise.all([
        StorageService.getToken(),
        StorageService.getUser(),
      ]);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
      }
    } catch (error) {
      console.error("Error loading stored auth:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (data: LoginData) => {
    try {
      setIsLoading(true);
      const response = await apiService.login(data);

      if (response.success && response.data) {
        const { user: userData, token: authToken } = response.data;

        // Store securely
        await Promise.all([
          StorageService.saveToken(authToken),
          StorageService.saveUser(userData),
        ]);

        setToken(authToken);
        setUser(userData);

        Toast.show({
          type: "success",
          text1: "Login Successful",
          text2: `Welcome back, ${userData.username}!`,
        });
      } else {
        throw new Error(response.message || "Login failed");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Login failed";
      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2: errorMessage,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setIsLoading(true);
      const response = await apiService.register(data);

      if (response.success && response.data) {
        const { user: userData, token: authToken } = response.data;

        // Store securely
        await Promise.all([
          StorageService.saveToken(authToken),
          StorageService.saveUser(userData),
        ]);

        setToken(authToken);
        setUser(userData);

        Toast.show({
          type: "success",
          text1: "Registration Successful",
          text2: `Welcome, ${userData.username}!`,
        });
      } else {
        throw new Error(response.message || "Registration failed");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Registration failed";
      Toast.show({
        type: "error",
        text1: "Registration Failed",
        text2: errorMessage,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await StorageService.clearAll();
      setToken(null);
      setUser(null);

      Toast.show({
        type: "info",
        text1: "Logged Out",
        text2: "You have been successfully logged out",
      });
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    isLoading,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
