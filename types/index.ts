export interface User {
  id: number;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  isOnline: boolean;
  lastSeen: string;
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
  updateOnlineStatus: (isOnline: boolean) => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface ChatContextType {
  messages: Message[];
  sendMessage: (message: string, receiverId?: number) => Promise<void>;
  sendFileMessage: (
    file: FileData,
    message?: string,
    receiverId?: number
  ) => Promise<void>;
  getPrivateMessages: (friendId: number) => Promise<Message[]>;
  getPrivateMessagesFromCache: (friendId: number) => Message[];
  subscribeToPrivateChannel: (friendId: number) => void;
  isLoading: boolean;
}
export interface FileData {
  uri: string;
  name: string;
  type: string;
  size?: number;
}
// types/index.ts (additions)
export interface FriendRequest {
  id: number;
  senderId: number;
  receiverId: number;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
  updatedAt: string;
  Sender?: User;
  Receiver?: User;
}

export interface Friend {
  id: number;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  isOnline: boolean;
  lastSeen: string;
  createdAt: string;
  friendshipCreatedAt: string;
}

export interface SearchUser {
  id: number;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  isOnline: boolean;
  lastSeen: string;
  createdAt: string;
}

// Update Message interface to support private messaging
export interface Message {
  id: number;
  senderId: number;
  receiverId?: number;
  username: string;
  message: string | null;
  fileUrl?: string | null;
  fileName?: string | null;
  fileType?: "image" | "video" | "document" | "audio" | null;
  fileSize?: number | null;
  isPrivate: boolean;
  createdAt: string;
}

export interface FriendContextType {
  friends: Friend[];
  pendingRequests: FriendRequest[];
  searchResults: SearchUser[];
  isLoading: boolean;
  searchUsers: (query: string) => Promise<void>;
  sendFriendRequest: (userId: number) => Promise<void>;
  acceptFriendRequest: (requestId: number) => Promise<void>;
  rejectFriendRequest: (requestId: number) => Promise<void>;
  loadFriends: () => Promise<void>;
  loadPendingRequests: () => Promise<void>;
  clearSearchResults: () => void;
}
