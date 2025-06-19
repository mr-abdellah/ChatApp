// services/api.ts (COMPLETE UPDATE)
import axios, { AxiosInstance, AxiosResponse } from "axios";
import {
  AuthResponse,
  Friend,
  FriendRequest,
  LoginData,
  Message,
  RegisterData,
  SearchUser,
} from "../types";
import { StorageService } from "./storage";

const API_BASE_URL = "http://10.0.2.2:3000/api"; // Change to your backend URL

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      async (config) => {
        const token = await StorageService.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          await StorageService.clearAll();
          // You might want to redirect to login here
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async register(data: RegisterData): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post(
      "/auth/register",
      data
    );
    return response.data;
  }

  async login(data: LoginData): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post(
      "/auth/login",
      data
    );
    return response.data;
  }

  async getProfile(): Promise<any> {
    const response = await this.api.get("/auth/profile");
    return response.data;
  }

  // Messages endpoints
  async getMessages(): Promise<Message[]> {
    const response = await this.api.get("/messages");
    return response.data.data || [];
  }

  async sendMessage(
    username: string,
    message: string,
    receiverId?: number
  ): Promise<Message> {
    const response = await this.api.post("/messages", {
      username,
      message,
      receiverId,
    });
    return response.data.data;
  }

  async sendFileMessage(
    username: string,
    file: any,
    message?: string,
    receiverId?: number
  ): Promise<Message> {
    const formData = new FormData();
    formData.append("username", username);
    if (message) formData.append("message", message);
    if (receiverId) formData.append("receiverId", receiverId.toString());

    formData.append("file", file as any);

    const response = await this.api.post("/messages/file", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.data;
  }

  // Friend System APIs
  async searchUsers(query: string): Promise<SearchUser[]> {
    const response = await this.api.get(
      `/users/search?q=${encodeURIComponent(query)}`
    );
    return response.data.data || [];
  }

  async sendFriendRequest(receiverId: number): Promise<void> {
    await this.api.post("/friends/request", { receiverId });
  }

  async acceptFriendRequest(requestId: number): Promise<void> {
    await this.api.post(`/friends/request/${requestId}/accept`);
  }

  async rejectFriendRequest(requestId: number): Promise<void> {
    await this.api.post(`/friends/request/${requestId}/reject`);
  }

  async getFriends(): Promise<Friend[]> {
    const response = await this.api.get("/friends");
    return response.data.data || [];
  }

  async getPendingRequests(): Promise<FriendRequest[]> {
    const response = await this.api.get("/friends/requests/pending");
    return response.data.data || [];
  }

  async getPrivateMessages(friendId: number): Promise<Message[]> {
    const response = await this.api.get(`/messages/private/${friendId}`);
    return response.data.data || [];
  }

  // Avatar upload
  async uploadAvatar(file: any): Promise<string> {
    const formData = new FormData();
    formData.append("avatar", file as any);

    const response = await this.api.post("/upload/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.url;
  }

  getFileUrl(fileUrl: string): string {
    if (fileUrl.startsWith("http")) {
      return fileUrl;
    }
    return `${API_BASE_URL.replace("/api", "")}${fileUrl}`;
  }
}

export const apiService = new ApiService();
