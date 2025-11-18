'use client';

import { useState, useEffect } from 'react';
import { ChatMessage } from '@/types/chatbot';
import { ChatbotMatcher } from '@shared/utils/chatbot-matcher';
import { CHATBOT_RESPONSES } from '@shared/constants/chatbot-responses';

export const useChatbotLogic = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickQuestions, setShowQuickQuestions] = useState(true);
  
  const matcher = new ChatbotMatcher(CHATBOT_RESPONSES);
  
  // Simple response matcher
  const getResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('price') || input.includes('cost')) {
      return 'Our wines range from €28.99 to €899.99. You can filter by price range on our products page.';
    }
    if (input.includes('crypto') || input.includes('bitcoin') || input.includes('payment')) {
      return 'We accept Bitcoin, Ethereum, Solana, Dogecoin, Litecoin, USDC, and USDT, as well as traditional Euro payments.';
    }
    if (input.includes('shipping') || input.includes('delivery')) {
      return 'We offer global VIP delivery with insurance options. Shipping costs vary by location and service level.';
    }
    if (input.includes('wine') || input.includes('recommend')) {
      return 'I recommend exploring our featured wines including Château Margaux 2015, Dom Pérignon Vintage 2012, and Opus One 2019.';
    }
    if (input.includes('region') || input.includes('bordeaux') || input.includes('champagne')) {
      return 'We have wines from prestigious regions including Bordeaux, Champagne, Burgundy, Napa Valley, Piedmont, and more.';
    }
    
    return 'Thank you for your question! For specific inquiries, please contact our wine experts who can provide personalized recommendations.';
  };

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        text: 'Welcome! I\'m here to help you with questions about our luxury wine collection, authenticity, payments, and more. How can I assist you today?',
        isUser: false,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [messages.length]);

  const sendMessage = async (text: string): Promise<void> => {
    if (!text.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      text: text.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setShowQuickQuestions(false);
    setIsTyping(true);

    // Simulate typing delay for better UX
    setTimeout(() => {
      const response = getResponse(text);
      
      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        text: response,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const sendQuickQuestion = (question: string): void => {
    sendMessage(question);
  };

  const getPredefinedQuestions = () => {
    return matcher.getPredefinedQuestions();
  };

  const clearMessages = (): void => {
    setMessages([]);
    setShowQuickQuestions(true);
  };

  return {
    messages,
    isTyping,
    showQuickQuestions,
    sendMessage,
    sendQuickQuestion,
    getPredefinedQuestions,
    clearMessages,
  };
};