export interface ChatMessage {
  role: string;
  content: string;
  hasImages: boolean;
  timestamp: string;
  messageId: string;
}

export interface ChatLog {
  timestamp: string;
  clientId: string;
  conversationId: string;
  duration: number;
  messageCount: number;
  imageCount: number;
  conversation: ChatMessage[];
  hasImages: string;
  type: string;
  urgency: string;
  labels: string[];
  disconnectReason: string;
}

export interface ChatLogFilters {
  startDate?: string;
  endDate?: string;
}