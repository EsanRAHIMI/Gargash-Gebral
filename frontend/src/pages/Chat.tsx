// src/pages/Chat.tsx
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useChat } from '../hooks/useChat';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ChatMessage from '../components/ChatMessage';
import VoiceChatButton from '../components/VoiceChatButton';

const chatUrl = import.meta.env.VITE_CHAT_URL;

const Chat = () => {
  const [message, setMessage] = useState('');
  const [apiStatus, setApiStatus] = useState<'healthy' | 'unhealthy' | 'checking'>('checking');
  const [apiError, setApiError] = useState<string | null>(null);
  const { messages, sendMessage, isLoading } = useChat();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // Test API connection on component mount
  useEffect(() => {
    const testApi = async () => {
      try {
        const response = await axios.get(`${chatUrl.replace('/ai', '')}/health`);
        console.log('API health check:', response.data);
        setApiStatus('healthy');
        setApiError(null);
      } catch (error) {
        console.error('API health check failed:', error);
        setApiStatus('unhealthy');
        const errorMessage = error instanceof Error ? error.message : 'Failed to connect to API';
        setApiError(errorMessage);
      }
    };
    
    testApi();
  }, []);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessage(message);
      setMessage('');
    }
  };
  
  // This function is passed to the VoiceChatButton to handle sending voice messages
  // It returns the AI response so it can be played as speech
  const handleVoiceMessage = async (text: string): Promise<string> => {
    if (text.trim()) {
      try {
        const response = await sendMessage(text, true); // Pass true to indicate this is a voice message
        return response;
      } catch (error) {
        console.error('Error processing voice message:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to process voice message';
        setApiError(errorMessage);
        return '';
      }
    }
    return '';
  };
  
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full flex flex-col p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Chat</h1>
          <p className="text-gray-600 dark:text-gray-400">Ask any question and get an intelligent response.</p>
          
          {/* API Status Indicator */}
          <div className={`mt-2 p-2 rounded-md text-sm ${
            apiStatus === 'healthy' 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
              : apiStatus === 'unhealthy'
              ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
          }`}>
            {apiStatus === 'healthy' && 'API connection is healthy'}
            {apiStatus === 'unhealthy' && 'API connection failed. Please check your connection.'}
            {apiStatus === 'checking' && 'Checking API connection...'}
          </div>
          
          {/* API Error Message */}
          {apiError && (
            <div className="mt-2 p-3 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-md shadow-md">
              <div className="font-medium">Connection Error</div>
              <div className="text-sm">{apiError}</div>
              <button 
                onClick={() => setApiError(null)}
                className="text-xs text-red-700 dark:text-red-300 hover:underline mt-2"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
        
        {/* Chat Container */}
        <div 
          ref={chatContainerRef}
          className="flex-1 bg-white dark:bg-slate-800 shadow rounded-lg p-6 mb-4 overflow-y-auto"
        >
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 my-16">
              <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No messages</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Start a conversation with the AI assistant.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <ChatMessage 
                  key={index} 
                  text={msg.text} 
                  isUser={msg.isUser} 
                  isVoice={msg.isVoice} 
                />
              ))}
            </div>
          )}
        </div>
        
        {/* Input Area with Voice Button */}
        <div className="flex items-center space-x-4">
          <form onSubmit={handleSubmit} className="flex flex-1">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 rounded-l-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
              placeholder="Type your message here..."
              disabled={isLoading}
            />
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 dark:bg-indigo-700 dark:hover:bg-indigo-600"
              disabled={isLoading || !message.trim()}
            >
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </form>
          
          {/* Voice Chat Button */}
          <VoiceChatButton 
            onSendMessage={handleVoiceMessage}
            disabled={isLoading}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Chat;