'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ChatMessage } from '@/types/chatbot';

interface ChatbotContextType {
  messages: ChatMessage[];
  isOpen: boolean;
  isTyping: boolean;
  addMessage: (message: ChatMessage) => void;
  setIsOpen: (open: boolean) => void;
  setIsTyping: (typing: boolean) => void;
  clearMessages: () => void;
}

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined);

interface ChatbotProviderProps {
  children: ReactNode;
}

export const ChatbotProvider: React.FC<ChatbotProviderProps> = ({ children }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const addMessage = (message: ChatMessage) => {
    setMessages(prev => [...prev, message]);
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const value: ChatbotContextType = {
    messages,
    isOpen,
    isTyping,
    addMessage,
    setIsOpen,
    setIsTyping,
    clearMessages,
  };

  return (
    <ChatbotContext.Provider value={value}>
      {children}
    </ChatbotContext.Provider>
  );
};

export const useChatbot = (): ChatbotContextType => {
  const context = useContext(ChatbotContext);
  if (context === undefined) {
    throw new Error('useChatbot must be used within a ChatbotProvider');
  }
  return context;
};

export default ChatbotContext;