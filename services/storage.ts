import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "auth_token";
const USER_KEY = "user_data";

export class StorageService {
  // Secure token storage
  static async saveToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    } catch (error) {
      console.error("Error saving token:", error);
      throw error;
    }
  }

  static async getToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  }

  static async removeToken(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } catch (error) {
      console.error("Error removing token:", error);
    }
  }

  // User data storage (less sensitive)
  static async saveUser(user: any): Promise<void> {
    try {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error("Error saving user:", error);
      throw error;
    }
  }

  static async getUser(): Promise<any | null> {
    try {
      const userData = await AsyncStorage.getItem(USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error getting user:", error);
      return null;
    }
  }

  static async removeUser(): Promise<void> {
    try {
      await AsyncStorage.removeItem(USER_KEY);
    } catch (error) {
      console.error("Error removing user:", error);
    }
  }

  static async clearAll(): Promise<void> {
    await Promise.all([this.removeToken(), this.removeUser()]);
  }
}
