export interface User {
  id: string;
  username: string;
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
  signIn: (username: string) => Promise<void>;
  signOut: () => void;
  isLoading: boolean;
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

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}
