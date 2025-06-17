import { FileData, Message } from "@/types";

const API_BASE_URL = "http://10.0.2.2:3000/api";

export class ApiClient {
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "API request failed");
      }

      return data;
    } catch (error) {
      console.log("API Error:", error);
      throw error;
    }
  }

  static async getMessages(): Promise<Message[]> {
    const response = await this.request<{ data: Message[] }>("/messages");
    return response.data || [];
  }

  static async sendMessage(
    username: string,
    message: string
  ): Promise<Message> {
    const response = await this.request<{ data: Message }>("/messages", {
      method: "POST",
      body: JSON.stringify({ username, message }),
    });
    return response.data!;
  }

  static async sendFileMessage(
    username: string,
    file: FileData,
    message?: string
  ): Promise<Message> {
    const formData = new FormData();
    formData.append("username", username);

    if (message) {
      formData.append("message", message);
    }

    // Create file object for FormData
    const fileObject = {
      uri: file.uri,
      type: file.type,
      name: file.name,
    } as any;

    formData.append("file", fileObject);

    const response = await fetch(`${API_BASE_URL}/messages/file`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to send file");
    }

    return data.data;
  }

  static async getUserMessages(username: string): Promise<Message[]> {
    const response = await this.request<{ data: Message[] }>(
      `/messages/user/${username}`
    );
    return response.data || [];
  }

  static getFileUrl(fileUrl: string): string {
    if (fileUrl.startsWith("http")) {
      return fileUrl;
    }
    return `${API_BASE_URL.replace("/api", "")}${fileUrl}`;
  }
}
