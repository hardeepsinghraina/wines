export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export interface PredefinedResponse {
  id: string;
  keywords: string[];
  response: string;
  category: 'authenticity' | 'payments' | 'storage' | 'product' | 'general';
  question?: string; // Optional predefined question for quick select
}

export interface ChatbotState {
  messages: ChatMessage[];
  isOpen: boolean;
  isTyping: boolean;
}