export interface User {
  id: number;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    token: string;
  };
  errors?: any[];
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  avatar?: string;
  bio?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface Message {
  id: number;
  username: string;
  message: string | null;
  fileUrl?: string | null;
  fileName?: string | null;
  fileType?: "image" | "video" | "document" | "audio" | null;
  fileSize?: number | null;
  createdAt: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface ChatContextType {
  messages: Message[];
  sendMessage: (message: string) => Promise<void>;
  sendFileMessage: (file: FileData, message?: string) => Promise<void>;
  isLoading: boolean;
}
export interface FileData {
  uri: string;
  name: string;
  type: string;
  size?: number;
}
