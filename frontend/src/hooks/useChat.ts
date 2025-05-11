// src/hooks/useChat.ts
import { useState } from 'react';
import axios from 'axios';

// Define interface for chat messages
interface Message {
  text: string;
  isUser: boolean;
  isVoice?: boolean; // Flag to indicate if this was a voice message
}

// Get chat URL from environment variables
const chatUrl = import.meta.env.VITE_CHAT_URL;

// Configure axios to include credentials
axios.defaults.withCredentials = true;

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (text: string, isVoice?: boolean): Promise<string> => {
    // Add user message to the chat
    setMessages(prev => [...prev, { text, isUser: true, isVoice }]);
    setIsLoading(true);
    setError(null);

    try {
      // Get recent message history for context (last 10 messages)
      const recentMessages = messages.slice(-10).map(msg => ({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.text
      }));
      
      // Send the message to the AI service with conversation history
      const response = await axios.post(chatUrl, {
        message: text,
        history: recentMessages
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true  // Send cookies
      });
      
      // Get the AI response text
      const aiResponse = response.data.response;
      
      // Add AI response to the chat if not a voice message
      // For voice messages, this will be added after speech playback
      if (!isVoice) {
        setMessages(prev => [...prev, { text: aiResponse, isUser: false }]);
      }
      
      setIsLoading(false);
      return aiResponse;
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to get a response from the AI. Please try again.');
      setIsLoading(false);
      return '';
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const addAiMessage = (text: string) => {
    setMessages(prev => [...prev, { text, isUser: false }]);
  };

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    addAiMessage
  };
};