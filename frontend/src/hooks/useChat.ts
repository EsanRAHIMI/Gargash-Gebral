// /frontend/src/hooks/useChat.ts
import { useState } from 'react'
import axios from 'axios'

// Define interface for chat messages
interface Message {
  text: string
  isUser: boolean
}

// Get chat URL from environment variables
const chatUrl = import.meta.env.VITE_CHAT_URL

// Configure axios to include credentials
axios.defaults.withCredentials = true

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const sendMessage = async (text: string) => {
    // Add user message to the chat
    setMessages(prev => [...prev, { text, isUser: true }])
    setIsLoading(true)
    setError(null)

    try {
      // Get the JWT token from cookie (handled by axios withCredentials)
      // Send the message to the AI service
      const response = await axios.post(chatUrl, { message: text }, {
        headers: {
          'Content-Type': 'application/json',
          // The token is sent via cookie by default since withCredentials is true
        }
      })
      
      // Add AI response to the chat
      setMessages(prev => [...prev, { text: response.data.response, isUser: false }])
    } catch (err) {
      console.error('Error sending message:', err)
      setError('Failed to get a response from the AI. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const clearMessages = () => {
    setMessages([])
  }

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
  }
}