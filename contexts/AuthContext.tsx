// contexts/AuthContext.tsx (COMPLETE UPDATE)
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

  // Update online status when app becomes active/inactive
  useEffect(() => {
    if (isAuthenticated) {
      updateOnlineStatus(true);

      // Set user offline when app is closed
      const handleAppStateChange = () => {
        updateOnlineStatus(false);
      };

      // Clean up on unmount
      return () => {
        updateOnlineStatus(false);
      };
    }
  }, [isAuthenticated]);

  const loadStoredAuth = async () => {
    try {
      const [storedToken, storedUser] = await Promise.all([
        StorageService.getToken(),
        StorageService.getUser(),
      ]);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
        // Update online status when loading stored auth
        await apiService.updateOnlineStatus(true);
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

  const updateOnlineStatus = async (isOnline: boolean) => {
    try {
      if (isAuthenticated) {
        await apiService.updateOnlineStatus(isOnline);
        setUser((prev) =>
          prev
            ? { ...prev, isOnline, lastSeen: new Date().toISOString() }
            : null
        );
      }
    } catch (error) {
      console.error("Error updating online status:", error);
    }
  };

  const logout = async () => {
    try {
      // Update online status to false before logout
      await apiService.logout();
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
    updateOnlineStatus,
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
